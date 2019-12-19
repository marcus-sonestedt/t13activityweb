import datetime
import logging

from django.urls import path, re_path
from django.views.decorators.cache import cache_page, cache_control
from django.views.decorators.vary import vary_on_cookie
from django.utils.decorators import method_decorator

from app.models import *
from app.serializers import *

from rest_framework.views import APIView
from rest_framework import authentication, generics, parsers, renderers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.http import HttpResponseBadRequest, HttpResponseForbidden

logger = logging.getLogger(__name__)

class ClearAuthToken(ObtainAuthToken):
    permission_classes = [IsAuthenticated]
    schema = None

    def post(self, request):
        deleted, _ = Token.objects.delete(user=self.serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_410_GONE)
        return Response("bye")


class MyActivitiesList(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'event')
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        member = Member.objects.get(user=self.request.user)

        return self.queryset \
            .filter(assigned=member)


class EventList(generics.ListAPIView):
    queryset = Event.objects.select_related('type')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset.all()

        return self.queryset.filter(id=id)


class UpcomingEventList(generics.ListAPIView):
    queryset = Event.objects \
                    .filter(start_date__gte=datetime.datetime.now()) \
                    .select_related('type')[:10]
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)
    read_only = True

    @method_decorator(cache_page(60*5))
    @method_decorator(vary_on_cookie)
    @method_decorator(cache_control(max_age=60, must_revalidate=True, no_store=True, stale_while_revalidate=10))
    def get(self, request, format=None):
        try:
            member = Member.objects.get(user=request.user.id)
        except Member.DoesNotExist:
            member = None

        user_id = request.user.id if request.user.is_authenticated else None

        return Response({
            'isLoggedIn': request.user.is_authenticated,
            'isStaff': request.user.is_staff,
            'userId': user_id,
            'memberId': member.id if member else None,
            'fullname' : member.fullname if member else None,
        })


class EventActivities(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'assigned')
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = EventActivitySerializer
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['event_id']
        except KeyError:
            return self.queryset.none()

        return self.queryset.filter(event=id)

class ActivityList(generics.ListAPIView):
    queryset = Activity.objects
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset

        return self.queryset \
                .filter(id=id) \
                .select_related('type', 'event', 'assigned')


class EventTypeList(generics.ListAPIView):
    queryset = EventType.objects
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset.all()

        return self.queryset.filter(id=id)


class ActivityTypeList(generics.ListAPIView):
    queryset = ActivityType.objects
    serializer_class = ActivityTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [authentication.SessionAuthentication]
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset.all()

        return self.queryset.filter(id=id)

class ActivityDelist(APIView):
    permission_classes = [IsAdminUser]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request, id):
        activity = Activity.objects.select_related('assigned').get(id=id)
        logger.info(f"User {request.user.id} about to delist from activity {activity.id}")

        if (activity.assigned.user != request.user):
            return HttpResponseForbidden("Inte bokad av dig")

        activity.assigned = None
        activity.save()

        return Response("Avbokad från " + activity.name)

class ActivityEnlist(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request, id):
        activity = Activity.objects.get(id=id)
        logger.info(f"User {request.user.id} about to enlist on activity {activity.id}")

        if (activity.assigned is not None):
            return HttpResponseForbidden("Redan bokad av " + activity.assigned.fullname)

        member = Member.objects.get(user=request.user)

        activity.assigned = member
        activity.save()

        return Response("Inbokad på " + activity.name)

class ActivityDelistRequestView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]
    parser_classes = [parsers.JSONParser]
    queryset = ActivityDelistRequest.objects.select_related('activity')
    serializer_class = ActivityDelistRequestSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset.all()

        return self.queryset.filter(activity__member__user=self.request.user)

class ActivityDelistRequestList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]
    parser_classes = [parsers.JSONParser]
    queryset = ActivityDelistRequest.objects.select_related('activity')
    serializer_class = ActivityDelistRequestSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset.all()

        return self.queryset.filter(activity__member__user=self.request.user)

##############################################################################

url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    path('myactivities', MyActivitiesList.as_view()),
    re_path('activity/(?P<id>.+)?', ActivityList.as_view()),
    re_path('event_activities/(?P<event_id>.+)', EventActivities.as_view()),

    path('upcomingevents', UpcomingEventList.as_view()),
    path('events', EventList.as_view()),
    re_path('events/(?P<id>.+)', EventList.as_view()),

    path('event_type', EventTypeList.as_view()),
    re_path('event_type/(?P<id>.+)', EventTypeList.as_view()),

    path('activity_type', ActivityTypeList.as_view()),
    re_path('activity_type/(?P<id>.+)', ActivityTypeList.as_view()),

    re_path('activity_enlist/(?P<id>.+)', ActivityEnlist.as_view()),
    re_path('activity_delist/(?P<id>.+)', ActivityDelist.as_view()),

    path('activity_delist_request', ActivityDelistRequestList.as_view()),
    re_path('activity_delist_request/(?P<pk>.+)', ActivityDelistRequestView.as_view()),
]