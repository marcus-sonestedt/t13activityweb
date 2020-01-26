import datetime
import logging

from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied, FieldDoesNotExist
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.db.models import Sum, Q

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

from app import serializers

from app.notifications import NotificationData, NotificationDataSerializer

logger = logging.getLogger(__name__)


class ClearAuthToken(ObtainAuthToken):
    permission_classes = [IsAuthenticated]
    schema = None

    def post(self, request):
        deleted, _ = Token.objects.delete(user=self.serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_410_GONE)
        return Response("bye")


class UserList(generics.ListAPIView, mixins.UpdateModelMixin):
    queryset = User.objects
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.queryset.filter(id=self.request.user.id)

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def check_object_permissions(self, request, obj):
        if request.method.upper() == 'PATCH' and request.user.id != obj.id:
            raise PermissionDenied("Can only PATCH self")

        return super().check_object_permissions(request, obj)


class MemberList(generics.ListAPIView, mixins.UpdateModelMixin):
    queryset = Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if 'pk' in self.kwargs:
            return self.queryset.filter(id=self.kwargs['pk'])

        return self.queryset

    def get_serializer_class(self):
        if self.request.method.upper() == 'PATCH':
            return serializers.MemberPatchSerializer
        else:
            return serializers.MemberSerializer

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        try:
            return self.partial_update(request, *args, **kwargs)
        except FieldDoesNotExist:
            return HttpResponseBadRequest('Field not found on model')
        except Member.DoesNotExist:
            return HttpResponseNotFound()

    def check_object_permissions(self, request, obj):
        if request.method.upper() == 'PATCH' \
            and not request.user.is_staff \
            and request.user.member.id != obj.id:
            raise PermissionDenied("Can only PATCH self (or as staff)")

        return super().check_object_permissions(request, obj)

    def perform_update(self, serializer):
        if len(serializer.validated_data) == 0:
            raise FieldDoesNotExist()

        member = Member.objects.get(id=self.kwargs['pk'])

        for k, v in serializer.validated_data.items():
            if k == 'membercard_number' and not self.request.user.is_staff:
                raise PermissionDenied()

            try:
                # has support for value really stored on User, such as fullname and email
                setattr(member, k, v)
            except Exception as e:
                logger.error(traceback.format_exc())
                logger.error("Failed to set " + k + ' = ' +
                             v + ' on ' + str(member))
                raise

        if 'phone_number' in serializer.validated_data:
            member.phone_verified = False
        if 'email' in serializer.validated_data:
            member.email_verified = False

        member.save()


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)
    read_only = True

    @method_decorator(vary_on_cookie)
    @method_decorator(cache_control(max_age=60, must_revalidate=True, no_store=True, stale_while_revalidate=10))
    def get(self, request, format=None):
        if request.user.is_authenticated:
            member = Member.objects.get(user=request.user)
        else:
            member = None

        data = NotificationData(member)
        serializer = NotificationDataSerializer(data)
        return Response(data=serializer.data)


MIN_ACTIVITY_SIGNUPS = int(apps.get_app_config('app').MIN_ACTIVITY_SIGNUPS)


class MemberReadyList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberReadySerializer

    def get_queryset(self):
        current_year = datetime.date.today().year
        return Member.objects \
            .filter(membercard_number='', phone_verified=True, email_verified=True) \
            .filter(activity__event__start_date__year=current_year) \
            .annotate(booked_weight_year=Sum('activity__weight')) \
            .filter(booked_weight_year__gte=MIN_ACTIVITY_SIGNUPS) \
            .order_by('user__first_name', 'user__last_name') \

class MemberNotReadyList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberReadySerializer

    def get_queryset(self):
        current_year = datetime.date.today().year
        return Member.objects \
            .exclude(Q(membercard_number='') | Q(phone_verified=True) | Q(email_verified=True)) \
            .filter(activity__event__start_date__year=current_year) \
            .annotate(booked_weight_year=Sum('activity__weight')) \
            .filter(booked_weight_year__lt=MIN_ACTIVITY_SIGNUPS) \
            .order_by('user__first_name', 'user__last_name') \


class MemberWithCardList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberReadySerializer
    queryset = Member.objects.exclude(membercard_number='')

##############################################################################


url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    re_path(r'^user/(?P<pk>[0-9]+)?$', UserList.as_view()),
    re_path(r'^member/(?P<pk>[0-9]+)?$', MemberList.as_view()),

    re_path(r'^members/ready/$', MemberReadyList.as_view()),
    re_path(r'^members/not_ready/$', MemberNotReadyList.as_view()),
    re_path(r'^members/has_card/$', MemberWithCardList.as_view())
]
