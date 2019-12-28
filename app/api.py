import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.views.decorators.cache import cache_page, cache_control, never_cache
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from app.models import *
from app.serializers import *

from rest_framework.views import APIView
from rest_framework import authentication, generics, parsers, renderers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.http import HttpResponseBadRequest, HttpResponseForbidden

from twilio.rest import Client as TwilioClient

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

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


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

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UpcomingEventList(generics.ListAPIView):
    queryset = Event.objects \
                    .filter(start_date__gte=datetime.datetime.now()) \
                    .select_related('type')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True

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
        try:
            member = Member.objects.get(user=request.user.id)
        except Member.DoesNotExist:
            member = None

        user_id = request.user.id if request.user.is_authenticated else None
        config = apps.get_app_config('app')

        return Response({
            'isLoggedIn': request.user.is_authenticated,
            'isStaff': request.user.is_staff,
            'userId': user_id,
            'memberId': member.id if member else None,
            'fullname': member.fullname if member else None,
            'settings': {
                'minSignups': config.MIN_ACTIVITY_SIGNUPS,
                'latestBookableDate': config.LATEST_BOOKABLE_DATE
            }
        })


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


class ActivityDelist(APIView):
    permission_classes = [IsAdminUser]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request, id):
        activity = Activity.objects.select_related('assigned').get(id=id)
        logger.info(
            f"User {request.user.id} about to delist from activity {activity.id}")

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
        logger.info(
            f"User {request.user.id} about to enlist on activity {activity.id}")

        if activity.assigned is not None:
            return HttpResponseForbidden("Redan bokad av " + activity.assigned.fullname)

        if not activity.bookable:
            return HttpResponseForbidden("Aktiviteten är inte bokningsbar (i dåtid eller blockerad)")

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


class ReceiveSMS(APIView):
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        sid = self.serializer.object['AccountSid']
        msgsid = self.serializer.object['MessagingServiceSid']

        if sid != settings.TWILIO_ACCOUNT_SID:
            raise HttpResponseForbidden('Invalid SID')

        body = self.serializer.object['Body']
        from_ = self.serializer.object['From']
        to = self.serializer.object['To']

        logger.info(f'Received SMS from {from_} to {to} via {msgsid}: "{body}"')


class VerifyPhone(APIView):
    _client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    parser_classes = [parsers.JSONParser]
    permission_classes = [IsAuthenticated]

    def _start_verify(self, phone):
        logger.info(f"Creating verification for {phone}")

        verification = _client.verify \
            .services(settings.TWILIO_VERIFY_SID) \
            .verifications \
            .create(to=phone, channel='sms')

        return verification

    def _check_verify(self, phone, code):
        logger.info(f"Checking verification for {phone}")

        verification = _client.verify \
            .services(settings.TWILIO_VERIFY_SID) \
            .verification_checks \
            .create(to=phone, code=code)

        return verification

    def post(self, request, action, code=None):
        member = request.user.member
        if member.phone_number is None:
            return HttpResponseForbidden("Member does not have a phone number")

        if action == 'send_code':
            v = self._start_verify(member.phone_number)
            if v.sid is None:
                return Response("Failed to create verify request, retry?", status=502)

            logger.info(f"Successfully created verification for {member.phone_number}")

            return Response('OK. Send the code for verification.')

        elif action == 'verify_code':
            c = self._check_verify(member.phone_number, code)
            if c.status != 'approved':
                return HttpResponseForbidden(c.status)

            logger.info(f"{member.fullname}'s number {member.phone_number} has been verified!")
            member.phone_verified = True
            member.save()

            return Response(c.status)

        else:
            return HttpResponseBadRequest('invalid action')


##############################################################################


url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    path('myactivities', MyActivitiesList.as_view()),
    re_path(r'activity/(?P<id>.+)?', ActivityList.as_view()),
    re_path(r'event_activities/(?P<event_id>.+)', EventActivities.as_view()),

    path('upcomingevents', UpcomingEventList.as_view()),
    path('events', EventList.as_view()),
    re_path(r'events/(?P<id>.+)', EventList.as_view()),

    path('event_type', EventTypeList.as_view()),
    re_path(r'event_type/(?P<id>.+)', EventTypeList.as_view()),

    path('activity_type', ActivityTypeList.as_view()),
    re_path(r'activity_type/(?P<id>.+)', ActivityTypeList.as_view()),

    re_path(r'activity_enlist/(?P<id>.+)', ActivityEnlist.as_view()),
    re_path(r'activity_delist/(?P<id>.+)', ActivityDelist.as_view()),

    path('activity_delist_request', ActivityDelistRequestList.as_view()),
    re_path(r'activity_delist_request/(?P<id>.+)',
            ActivityDelistRequestView.as_view()),

    path('sms', ReceiveSMS.as_view()),
    re_path(r'phone/(?P<action>[a-z]+)(/(?P<code>\w+))?', VerifyPhone.as_view()),
]
