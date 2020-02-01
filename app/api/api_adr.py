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
    ActivityDelistRequestSerializer, ActivityDelistRequestDeepSerializer, EventActivitySerializer

logger = logging.getLogger(__name__)


class ActivityEnlist(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request, id):
        activity = Activity.objects.get(id=id)
        logger.info(
            f"User {request.user.id} about to enlist on activity {activity.id}")

        member = Member.objects.get(user=request.user)
        if not member.email_verified or not member.phone_verified:
            return HttpResponseForbidden("Måste verifiera email och telefon innan bokning!")

        if activity.assigned == member:
            return Response("Du är redan bokad på denna uppgift")

        if activity.assigned is not None:
            if activity.active_delist_request is None:
                return HttpResponseForbidden("Uppgiften är redan bokad av " + activity.assigned.fullname)
            else:
                logger.info("Transferring activity due to active ADR.")

        if not activity.bookable:
            return HttpResponseForbidden("Aktiviteten är inte bokningsbar")

        adrs = ActivityDelistRequest.objects.filter(activity=activity, approved=None)
        if adrs:
            logger.info("Deleting delist requests for this member/activity")
            adrs.delete()

        activity.assigned = member
        activity.save()

        return Response("Inbokad på " + activity.name)


class ADRView(generics.RetrieveUpdateDestroyAPIView, mixins.CreateModelMixin):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]
    parser_classes = [parsers.JSONParser]
    queryset = ActivityDelistRequest.objects \
        .select_related('activity', 'member') \
        .prefetch_related('activity__assigned')
    serializer_class = ActivityDelistRequestSerializer

    def get_queryset(self):
        qs = self.queryset

        if not self.request.user.is_staff:
            qs = qs.filter(activity__assigned__user=self.request.user)

        return qs.all()

    def post(self, request, *args, **kwargs):
        try:
            return self.create(request, *args, **kwargs)
        except RuleViolationException as e:
            return HttpResponseForbidden(e)


class ADRByActivityView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]
    queryset = ActivityDelistRequest.objects \
        .select_related('activity', 'member') \
        .prefetch_related('activity__assigned')
    serializer_class = ActivityDelistRequestDeepSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.serializer = self.serializer_class()

    @method_decorator(never_cache)
    def get(self, request, id):
        qs = self.queryset    
        if not self.request.user.is_staff:
            qs = qs.filter(activity__assigned__user=self.request.user)

        model = qs.get(activity=id)

        return Response(self.serializer.to_representation(instance=model))

class ADRList(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [authentication.SessionAuthentication]
    parser_classes = [parsers.JSONParser]
    serializer_class = ActivityDelistRequestDeepSerializer
    queryset = ActivityDelistRequest.objects \
        .select_related('activity') \
        .prefetch_related('activity__assigned')

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset.all()

        return self.queryset.filter(activity__assigned__user_id=self.request.user.id)

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

##############################################################################

url_patterns = [
    re_path(r'activity_enlist/(?P<id>.+)', ActivityEnlist.as_view()),

    path('activity_delist_request', ADRList.as_view()),
    re_path(r'activity_delist_request/(?P<pk>[0-9]+)', ADRView.as_view()),
    re_path(r'activity_delist_request/create', ADRView.as_view()),
    re_path(r'activity_delist_request/activity/(?P<id>.+)', ADRByActivityView.as_view()),
]
