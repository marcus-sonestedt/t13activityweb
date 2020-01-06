import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseBadRequest, HttpResponseForbidden
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

from app.models import Activity, ActivityType, Event, EventType, Member, \
    ActivityDelistRequest, RuleViolationException, FAQ

from app.serializers import ActivitySerializer, ActivityTypeSerializer, \
    AttachmentSerializer, EventSerializer, EventTypeSerializer, MemberSerializer, \
    EventActivitySerializer, FAQSerializer, UserSerializer

logger = logging.getLogger(__name__)



class MyActivitiesList(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'event')
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        member = Member.objects.get(user=self.request.user)
        return self.queryset.filter(assigned=member)

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



class FAQList(generics.ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]
    read_only = True

##############################################################################


url_patterns = [
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

    path('faq', FAQList.as_view())
]