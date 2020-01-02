import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.views.decorators.cache import cache_page, cache_control, never_cache
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponseBadRequest, HttpResponseForbidden

from rest_framework.views import APIView
from rest_framework import authentication, generics, parsers, renderers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import mixins

from app.models import Activity, ActivityType, Event, EventType, Member, \
    ActivityDelistRequest, RuleViolationException
from app.serializers import ActivitySerializer, ActivityTypeSerializer, \
    AttachmentSerializer, EventSerializer, EventTypeSerializer, MemberSerializer, \
    EventActivitySerializer

logger = logging.getLogger(__name__)


class ClearAuthToken(ObtainAuthToken):
    permission_classes = [IsAuthenticated]
    schema = None

    def post(self, request):
        deleted, _ = Token.objects.delete(user=self.serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_410_GONE)
        return Response("bye")


class MemberList(generics.ListAPIView):        
    queryset = Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]
    serializer_class = MemberSerializer

class MyActivitiesList(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'event')
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        member = Member.objects.get(user=self.request.user)

        return self.queryset \
            .filter(assigned=member)

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class EventList(generics.ListAPIView):
    queryset = Event.objects.select_related('type')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if 'upcoming' in self.kwargs:
            return self.queryset.filter(start_date__gte=datetime.datetime.now())

        if 'id' in self.kwargs:
            return self.queryset.filter(id=self.kwargs['id'])

        else:
            return self.queryset.all()

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)
    read_only = True

    @method_decorator(cache_page(60*5))
    @method_decorator(vary_on_cookie)
    @method_decorator(cache_control(max_age=60, must_revalidate=True, no_store=True, stale_while_revalidate=10))
    def get(self, request, format=None):
        notifications = []
        config = apps.get_app_config('app')

        response_dict = {
            'isLoggedIn': request.user.is_authenticated,
            'isStaff': request.user.is_staff,
            'settings': {
                'minSignups': config.MIN_ACTIVITY_SIGNUPS,
                'latestBookableDate': config.LATEST_BOOKABLE_DATE
            },
            'notifications': notifications
        }

        try:
            member = Member.objects.get(user=request.user.id)

            response_dict['myDelistRequests'] = \
                ActivityDelistRequest.objects.filter(member=member).count()

            if request.user.is_staff:
                response_dict['unansweredDelistRequests'] = \
                    ActivityDelistRequest.objects.filter(approved=None).exclude(member=member).count()

            if not member.phone_verified:
                notifications.append({
                    'message': 'Ditt telefonnummer är inte verifierat än',
                    'link': '/frontend/verify/phone'})

            if not member.email_verified:
                notifications.append({
                    'message': 'Din emailaddress är inte verifierad än',
                    'link': '/frontend/verify/email'})

        except Member.DoesNotExist:
            member = None

        response_dict.update({
            'userId': request.user.id if request.user.is_authenticated else None,
            'memberId': member.id if member else None,
            'fullname': member.fullname if member else None,
        })

        return Response(response_dict)


class EventActivities(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'assigned', 'event')
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = EventActivitySerializer
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['event_id']
        except KeyError:
            return self.queryset.none()

        return self.queryset.filter(event=id)

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


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

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


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

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


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

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ActivityEnlist(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request, id):
        activity = Activity.objects.get(id=id)
        logger.info(
            f"User {request.user.id} about to enlist on activity {activity.id}")

        member = Member.objects.get(user=request.user)

        if (activity.assigned == member):
            return Response("Redan bokad på denna aktivitet")

        if activity.assigned is not None:
            return HttpResponseForbidden("Redan bokad av " + activity.assigned.fullname)

        if not activity.bookable:
            return HttpResponseForbidden("Aktiviteten är inte bokningsbar (i dåtid eller blockerad)")

        activity.assigned = member
        activity.save()

        return Response("Inbokad på " + activity.name)


##############################################################################


url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    re_path(r'^member/(?P<pk>[0-9]+)?', MemberList.as_view()),

    path('myactivities', MyActivitiesList.as_view()),
    re_path(r'^activity/(?P<id>[0-9]+)?', ActivityList.as_view()),
    re_path(
        r'event_activities/(?P<event_id>[0-9]+)', EventActivities.as_view()),

    path('events', EventList.as_view()),
    re_path(r'events/(?P<upcoming>upcoming)', EventList.as_view()),
    re_path(r'events/(?P<id>[0-9]+)', EventList.as_view()),

    path('event_type', EventTypeList.as_view()),
    re_path(r'event_type/(?P<id>[0-9]+)', EventTypeList.as_view()),

    path('activity_type', ActivityTypeList.as_view()),
    re_path(r'activity_type/(?P<id>[0-9]+)', ActivityTypeList.as_view()),
]
