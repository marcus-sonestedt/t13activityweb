import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User

from django.views.decorators.cache import cache_page, cache_control, never_cache
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework import authentication, generics, parsers, renderers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import mixins

from app import models
from app.models import Activity, ActivityType, Event, EventType, Member, \
    ActivityDelistRequest, RuleViolationException, FAQ

from app import serializers
from app.serializers import ActivitySerializer, ActivityTypeSerializer, \
    AttachmentSerializer, EventSerializer, EventTypeSerializer, MemberSerializer, \
    EventActivitySerializer, FAQSerializer, UserSerializer
from django.db.models.aggregates import Count
from django.db.models import Q

logger = logging.getLogger(__name__)


class MyActivitiesList(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'event').prefetch_related('event__type')
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        member = Member.objects.get(user=self.request.user)
        return self.queryset \
            .filter(Q(assigned=member) | Q(assigned_for_proxy=member),
                    event__start_date__year=datetime.date.today().year)

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ProxyActivityList(MyActivitiesList):
    def get_queryset(self):
        member = Member.objects.get(user=self.request.user)
        proxy = member.proxies.get(id=self.kwargs['proxy_id'])
        return self.queryset.filter(assigned=proxy, assigned_for_proxy=member)


class EventList(generics.ListAPIView):
    queryset = Event.objects.select_related('type') \
        .prefetch_related('coordinators', 'coordinators__user', 'attachments',
                          'activities', )

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if not self.request.user.is_authenticated:
            return serializers.EventPublicSerializer
        elif 'id' in self.kwargs:
            return serializers.EventSerializer
        else:
            return serializers.EventListSerializer

    def get_queryset(self):
        if 'id' in self.kwargs:
            qs = self.queryset.filter(id=self.kwargs['id'])
        else:
            today = datetime.date.today()
            if 'upcoming' in self.kwargs:
                qs = self.queryset.filter(start_date__gte=today, start_date__year=today.year) 
            else:
                year = self.request.query_params.get('year', today.year)
                qs = self.queryset.filter(start_date__year=year)             
                
            qs = qs.order_by('start_date', 'end_date', 'name') \
                    .annotate(_activities_available_count=Count(models.Event.activities_available_count_query()))

        if self.request.user.is_authenticated:
            member = models.Member.objects.get(user=self.request.user)
            qs = qs.annotate(current_user_assigned=Count(
                'activities', filter=Q(activities__assigned=member)))

        return qs

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


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


class ActivityList(generics.ListAPIView, mixins.UpdateModelMixin):
    queryset = Activity.objects
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        try:
            pk = self.kwargs['pk']
        except KeyError:
            return self.queryset

        return self.queryset \
            .filter(id=pk) \
            .select_related('type', 'event', 'assigned')

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def patch(self, request, pk):
        activity = self.get_queryset().first()

        if not activity:
            raise ObjectDoesNotExist()

        if not self.request.user.is_staff and \
                (not activity.assigned or activity.assigned.user != self.request.user):
            raise PermissionDenied(
                "Can only modify comment if staff that you are assigned to")

        if list(request.data.keys()) != ['comment']:
            print(request.data.keys())
            raise PermissionDenied(
                "Can only modify 'comment' of an activity via API")

        return self.partial_update(request, pk)


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


class FAQList(generics.ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]
    read_only = True


class InfoTextList(generics.RetrieveAPIView):
    queryset = models.InfoText.objects.all()
    serializer_class = serializers.InfoTextSerializer
    permission_classes = [AllowAny]
    read_only = True

##############################################################################


url_patterns = [
    path('activity_my', MyActivitiesList.as_view()),
    re_path(
        r'^activity_for_proxy/(?P<proxy_id>[0-9]+)?', ProxyActivityList.as_view()),

    re_path(r'^activity/(?P<pk>[0-9]+)?', ActivityList.as_view()),
    re_path(
        r'event_activities/(?P<event_id>[0-9]+)', EventActivities.as_view()),

    path('events', EventList.as_view()),
    re_path(r'events/(?P<upcoming>upcoming)', EventList.as_view()),
    re_path(r'events/(?P<id>[0-9]+)', EventList.as_view()),

    path('event_type', EventTypeList.as_view()),
    re_path(r'event_type/(?P<id>[0-9]+)', EventTypeList.as_view()),

    path('activity_type', ActivityTypeList.as_view()),
    re_path(r'activity_type/(?P<id>[0-9]+)', ActivityTypeList.as_view()),

    path('faq', FAQList.as_view()),
    re_path(r'infotext/(?P<pk>[\w-]+)', InfoTextList.as_view())
]
