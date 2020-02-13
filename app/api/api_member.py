import datetime
import logging

from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied, FieldDoesNotExist
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.db.models import Sum, Q, Count

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

from app import serializers

from app.notifications import NotificationData, NotificationDataSerializer

logger = logging.getLogger(__name__)

MIN_ACTIVITY_SIGNUPS = int(apps.get_app_config('app').MIN_ACTIVITY_SIGNUPS)


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
            .filter(Q(phone_verified=False) | Q(email_verified=False) | Q(membercard_number='')) \
            .filter(activity__event__start_date__year=current_year) \
            .annotate(booked_weight_year=Sum('activity__weight')) \
            .filter(booked_weight_year__lt=MIN_ACTIVITY_SIGNUPS) \
            .order_by('user__first_name', 'user__last_name') \



class MemberWithCardList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberReadySerializer
    queryset = Member.objects.exclude(
        Q(membercard_number='') | Q(membercard_number='-'))


class DoubleBookedMembersList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.DoubleBookedSerializer

    def get_queryset(self):
        current_year = datetime.date.today().year

        # does not count only non-unique assigned activities ...  :-|
        events = Event.objects \
            .filter(start_date__year=current_year) \
            .annotate(doublebooking=Count("activities__assigned")) \
            .filter(doublebooking__gte=2) \
            .order_by()

        print(f"Found {len(events)} event(s) with potential double booking")
        print(events)
        values = []

        for e in events:
            acts = e.activities.exclude(assigned=None).values('assigned', 'comment')
            aa = [a['assigned'] for a in acts]
            dbu = set(a for a in aa if aa.count(a) >= 2)

            if len(dbu) == 0:
                continue

            print(f"{e.name} has {len(dbu)} double booked user(s)")
            print(dbu)

            for m in dbu:
                assigned_for_user = e.activities.filter(assigned=m).select_related('assigned')
                for a in assigned_for_user:
                    other_comments = [d['comment'] for d in assigned_for_user.exclude(id=a.id).values('comment')]
                    if a.comment in other_comments:           
                        # print(a)
                        values.append({
                            'assigned_id': a.assigned.id,
                            'assigned_fullname': a.assigned.fullname,
                            'event_id': e.id,
                            'event_name': e.name,
                            'activity_id': a.id,
                            'activity_name': a.name,
                            'activity_comment': a.comment,
                        })

        return sorted(values, key=lambda v: (v['assigned_fullname'], v['event_id']))


##############################################################################

url_patterns = [
    re_path(r'^member/(?P<pk>[0-9]+)?$', MemberList.as_view()),

    re_path(r'^members/ready/$', MemberReadyList.as_view()),
    re_path(r'^members/not_ready/$', MemberNotReadyList.as_view()),
    re_path(r'^members/has_card/$', MemberWithCardList.as_view()),
    re_path(r'^members/double_booked/$', DoubleBookedMembersList.as_view())
]
