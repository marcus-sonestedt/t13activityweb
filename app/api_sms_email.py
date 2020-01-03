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

from twilio.rest import Client as TwilioClient

logger = logging.getLogger(__name__)


class ReceiveSMS(APIView):
    parser_classes = [parsers.JSONParser,
                      parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        sid = self.serializer.object['AccountSid']
        msgsid = self.serializer.object['MessagingServiceSid']

        if sid != settings.TWILIO_ACCOUNT_SID:
            logger.warning(
                f"Got SMS via invalid SID\n{self.serializer.object}")
            raise HttpResponseForbidden('Invalid SID')

        body = self.serializer.object['Body']
        from_ = self.serializer.object['From']
        to = self.serializer.object['To']

        logger.info(
            f'Received SMS from {from_} to {to} via {msgsid}: "{body}"')


class VerifyPhone(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self._client = TwilioClient(
            settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    parser_classes = [parsers.JSONParser]
    permission_classes = [IsAuthenticated]

    def _start_verify(self, phone):
        logger.info(f"Creating verification for {phone}")

        verification = self._client.verify \
            .services(settings.TWILIO_VERIFY_SID) \
            .verifications \
            .create(to=phone, channel='sms')

        return verification

    def _check_verify(self, phone, code):
        logger.info(f"Checking verification for {phone}")

        verification_check = self._client.verify \
            .services(settings.TWILIO_VERIFY_SID) \
            .verification_checks \
            .create(to=phone, code=code)

        return verification_check

    def post(self, request, action, code=None):
        member = request.user.member
        if member.phone_number is None:
            return HttpResponseForbidden("Member does not have a phone number")

        if action == 'send':
            v = self._start_verify(member.phone_number)
            if v.sid is None:
                return Response("Failed to create verify request, retry?", status=502)

            logger.info(
                f"Successfully created verification for {member.phone_number}")

            return Response('OK. Send the code for verification.')

        elif action == 'check':
            c = self._check_verify(member.phone_number, code)
            if c.valid:
                logger.info(
                    f"{member.fullname}'s number {member.phone_number} has been verified!")
                member.phone_verified = True
                member.save()
            else:
                logger.info(
                    f"{member.fullname}'s sent an invalid verification code!")

            return Response(c.status)

        else:
            return HttpResponseBadRequest('invalid action')


class VerifyEmail(APIView):
    parser_classes = [parsers.JSONParser]
    permission_classes = [IsAuthenticated]

    def get(self, reqest, action, code):
        member = request.user.member

        if action == 'check':
            c = self._check_verify(member.email, code)
            if c.status != 'approved':
                return HttpResponseForbidden(c.status)
            member.email_verfied = True
            member.save()
            return Redirect("/frontend/verify/email?state=Success")

    def post(self, request, action, code=None):
        member = request.user.member
        if member.phone_number is None:
            return HttpResponseForbidden("Member does not have a phone number")

        if action == 'send':
            v = self._start_verify(member.phone_number)
            if v.sid is None:
                return Response("Failed to create verify request, retry?", status=502)

            logger.info(
                f"Successfully created verification for {member.phone_number}")

            return Response('OK. Send the code for verification.')

        elif action == 'check':
            c = self._check_verify(member.phone_number, code)
            if c.status != 'approved':
                return HttpResponseForbidden(c.status)

        else:
            return HttpResponseBadRequest('invalid action')

##############################################################################


url_patterns = [
    path('sms', ReceiveSMS.as_view()),
    re_path(
        r'verify/phone/(?P<action>[a-z]+)(/(?P<code>\w+))?', VerifyPhone.as_view()),
    re_path(
        r'verify/email/(?P<action>[a-z]+)(/(?P<code>\w+))?', VerifyEmail.as_view()),
]
