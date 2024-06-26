import datetime
import logging
import traceback
import json

from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied, FieldDoesNotExist
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound, HttpResponse
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.db.models import Sum, Q, Count
from django.db import transaction
from django.db import IntegrityError

from django.views.decorators.cache import cache_page, cache_control, never_cache
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.csrf import csrf_exempt

from rest_framework import mixins
from rest_framework import authentication, generics, parsers, renderers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.parsers import JSONParser

from app import models, serializers

from app.notifications import NotificationData, NotificationDataSerializer
from http import HTTPStatus


logger = logging.getLogger(__name__)

MIN_ACTIVITY_SIGNUPS = int(apps.get_app_config('app').MIN_ACTIVITY_SIGNUPS)

class MemberList(generics.ListAPIView, mixins.UpdateModelMixin, mixins.CreateModelMixin):
    queryset = models.Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if 'pk' in self.kwargs:
            return self.queryset.filter(id=self.kwargs['pk'])

        return self.queryset

    def get_serializer_class(self):
        if self.request.method.upper() == 'PATCH':
            return serializers.MemberPatchSerializer
        elif self.request.method.upper() == 'PUT':
            return serializers.CreateMemberSerializer
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
        except models.Member.DoesNotExist:
            return HttpResponseNotFound()

    def check_object_permissions(self, request, obj):
        if request.method.upper() == 'PATCH' \
                and not request.user.is_staff \
                and request.user.member.id != obj.id:
            raise PermissionDenied(
                "Can only PATCH self, or proxies who haven't logged in themselves yet (unless is staff).")

        return super().check_object_permissions(request, obj)

    def perform_update(self, serializer):
        if len(serializer.validated_data) == 0:
            raise FieldDoesNotExist()

        member = models.Member.objects.select_related('user').get(id=self.kwargs['pk'])

        for k, v in serializer.validated_data.items():
            if k == 'membercard_number' and not self.request.user.is_staff:
                raise PermissionDenied()

            try:
                # has support for value really stored on User, such as fullname and email
                setattr(member, k, v)
            except Exception:
                logger.error(traceback.format_exc())
                logger.error("Failed to set " + k + ' = ' +
                             v + ' on ' + str(member))
                raise

        if 'phone_number' in serializer.validated_data and \
            serializer.validated_data['phone_number'] != member.phone_number:
            member.phone_verified = False

        if 'email' in serializer.validated_data and \
            serializer.validated_data['email'] != member.email:
            member.email = serializer.validated_data['email']
            member.email_verified = False

        member.save()

    def put(self, request, *args, **kwargs):
        try:
            return self.create(request, *args, **kwargs)
        except IntegrityError as e:
            traceback.print_exc()
            resp = HttpResponse(str(e))
            resp.status_code = HTTPStatus.CONFLICT
            return resp

    def perform_create(self, serializer):
        email = serializer.validated_data['email']
        name = serializer.validated_data['fullname'].split(' ', 1)
        phone = serializer.validated_data['phone_number']

        if User.objects.filter(email=email).count() > 0:
            raise IntegrityError(
                f"A user with email '{email}' already exists!")

        if models.Member.objects.filter(phone_number=phone).count() > 0:
            raise IntegrityError(
                f"A user with phone number '{phone}' already exists!")

        proxy_for = models.Member.objects.get(user_id=self.request.user.id)

        with transaction.atomic():
            user = User(username=email, email=email,
                        first_name=name[0], last_name=name[1])
            user.save()

            member = models.Member.objects.get(user=user)
            member.phone_number = phone
            member.comment=serializer.validated_data['comment']
            member.proxy.add(proxy_for)
            member.save()


class MemberReadyList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberBookWeightSerializer

    def get_queryset(self):
        current_year = datetime.date.today().year
        return models.Member.objects \
            .filter(membercard_number='', phone_verified=True, email_verified=True) \
            .filter(activity__event__start_date__year=current_year) \
            .annotate(booked_weight_year=Sum('activity__weight')) \
            .filter(booked_weight_year__gte=MIN_ACTIVITY_SIGNUPS) \
            .order_by('user__first_name', 'user__last_name') \



class MemberNotReadyList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberBookWeightSerializer

    def get_queryset(self):
        current_year = datetime.date.today().year
        return models.Member.objects \
            .filter(Q(phone_verified=False) | Q(email_verified=False) | Q(membercard_number='')) \
            .filter(activity__event__start_date__year=current_year) \
            .annotate(booked_weight_year=Sum('activity__weight')) \
            .filter(booked_weight_year__lt=MIN_ACTIVITY_SIGNUPS) \
            .order_by('user__first_name', 'user__last_name') \



class MemberWithCardList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.MemberBookWeightSerializer
    queryset = models.Member.objects.exclude(
        Q(membercard_number='') | Q(membercard_number='-'))


class DoubleBookedMembersList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.DoubleBookedSerializer

    def get_queryset(self):
        current_year = datetime.date.today().year

        # does not count only non-unique assigned activities ...  :-|
        events = models.Event.objects \
            .filter(start_date__year=current_year) \
            .annotate(doublebooking=Count("activities__assigned")) \
            .filter(doublebooking__gte=2) \
            .order_by()

        print(f"Found {len(events)} event(s) with potential double booking")
        print(events)
        values = []

        for e in events:
            acts = e.activities.exclude(
                assigned=None).values('assigned', 'comment')
            aa = [a['assigned'] for a in acts]
            dbu = set(a for a in aa if aa.count(a) >= 2)

            if len(dbu) == 0:
                continue

            print(f"{e.name} has {len(dbu)} double booked user(s)")
            print(dbu)

            for m in dbu:
                assigned_for_user = e.activities.filter(
                    assigned=m).select_related('assigned')
                for a in assigned_for_user:
                    other_comments = [d['comment'] for d in assigned_for_user.exclude(
                        id=a.id).values('comment')]
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


class MemberLicenseList(generics.ListAPIView, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.LicenseSerializer
    queryset = models.License.objects
    pagination_class = None
    lookup_field = 'id'

    def get_queryset(self):
        queryset = self.queryset
        if self.kwargs['member_id'] is not None:
            queryset = queryset.filter(member=self.kwargs['member_id'])
        if self.kwargs['id'] is not None:
            queryset = queryset.filter(id=self.kwargs['id'])
        return queryset

    def put(self,  request, *args, **kwargs):
        if self.kwargs['id'] is not None:
            logger.warn("Expected 'id' to be null for PUT")
            return HttpResponseBadRequest()

        try:
            return self.create(request, *args, **kwargs)            
        except IntegrityError as e:
            traceback.print_exc()
            resp = HttpResponse(str(e))
            resp.status_code = HTTPStatus.CONFLICT
            return resp

    def patch(self, request, *args, **kwargs):
        if self.kwargs['id'] is None:
            logger.warn("Expected 'id' to be valid for PATCH")
            return HttpResponseBadRequest()

        try:
            return self.partial_update(request, *args, **kwargs)
        except FieldDoesNotExist as e:
            return HttpResponseBadRequest(str(e))
        except (models.Member.DoesNotExist, models.License.DoesNotExist) as e:
            return HttpResponseNotFound(str(e))

    def delete(self, request, *args, **kwargs):
        if self.kwargs['id'] is None:
            logger.warn("Expected 'id' to be valid for DELETE")
            return HttpResponseBadRequest()

        return self.destroy(request, *args, **kwargs)

    def check_object_permissions(self, request, obj):
        if self.request.method.upper() in ['DELETE', 'PATCH', 'PUT'] \
            and self.request.user.member.id != obj.member.id:
            return HttpResponseForbidden('Can only modify licenses for self')

        return super().check_object_permissions(request, obj)



class MemberDriverList(generics.ListAPIView, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = serializers.DriverSerializer
    queryset = models.Driver.objects
    pagination_class = None
    lookup_field = 'id'

    def get_queryset(self):
        queryset = self.queryset
        if self.kwargs['member_id'] is not None:
            queryset = queryset.filter(member=self.kwargs['member_id'])
        if self.kwargs['id'] is not None:
            queryset = queryset.filter(id=self.kwargs['id'])
        return queryset

    def put(self,  request, *args, **kwargs):
        if self.kwargs['id'] is not None:
            logger.warn("Expected 'id' to be null for PUT")
            return HttpResponseBadRequest()

        try:
            return self.create(request, *args, **kwargs)            
        except IntegrityError as e:
            traceback.print_exc()
            resp = HttpResponse(str(e))
            resp.status_code = HTTPStatus.CONFLICT
            return resp

    def patch(self, request, *args, **kwargs):
        if self.kwargs['id'] is None:
            logger.warn("Expected 'id' to be valid for PATCH")
            return HttpResponseBadRequest()

        try:
            return self.partial_update(request, *args, **kwargs)
        except FieldDoesNotExist as e:
            return HttpResponseBadRequest(str(e))
        except (models.Member.DoesNotExist, models.Driver.DoesNotExist) as e:
            return HttpResponseNotFound(str(e))

    def delete(self, request, *args, **kwargs):
        if self.kwargs['id'] is None:
            logger.warn("Expected 'id' to be valid for DELETE")
            return HttpResponseBadRequest()

        return self.destroy(request, *args, **kwargs)

    def check_object_permissions(self, request, obj):
        if self.request.method.upper() in ['DELETE', 'PATCH', 'PUT'] \
            and self.request.user.member.id != obj.member.id:
            return HttpResponseForbidden('Can only modify drivers for self')

        return super().check_object_permissions(request, obj)



class CompletionsList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = serializers.CompletionSerializer

    def get_queryset(self):
        today = datetime.date.today()
        last_week = today - datetime.timedelta(days=7)

        acts = models.Activity.objects \
            .exclude(assigned=None) \
            .exclude(cancelled=True) \
            .filter(event__start_date__year=today.year) \
            .filter(event__start_date__lte=today) \
            .order_by('-event__start_date', 'start_time') 

        user_filter = self.request.GET.get('filter', None)

        if user_filter:
            acts = acts.filter(Q(assigned__user__first_name__icontains=user_filter)
                               |Q(assigned__user__last_name__icontains=user_filter))
        else:
            acts = acts.exclude(completed=True, 
                event__start_date__lt=last_week) 

        print(f"Found {len(acts)} activities that might need confirmation")
        #print(acts)
        values = []

        for a in acts:
            e = a.event
            start_date = datetime.datetime.combine(date=e.start_date, time=a.start_time or datetime.time(0, 0))
            end_date = datetime.datetime.combine(date=e.end_date, time=a.end_time or datetime.time(0, 0))
            values.append({
                'assigned_id': a.assigned.id,
                'assigned_fullname': a.assigned.fullname,
                'event_id': e.id,
                'event_name': e.name,
                'activity_id': a.id,
                'activity_name': a.name,
                'completed': a.completed,
                'start_date': start_date,
                'end_date': end_date
            })

        return values


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
@parser_classes([JSONParser])
def set_completed(request, activity_id):
    try:
        activity = models.Activity.objects.get(id=activity_id)
    except models.Activity.DoesNotExist:
        return HttpResponseNotFound()
    
    if activity.event.start_date > datetime.date.today():
        return HttpResponseBadRequest("Activity is in the future")

    if activity.assigned is None:
        return HttpResponseBadRequest("Activity is not assigned")

    if activity.cancelled:
        return HttpResponseBadRequest("Activity is cancelled")

    completed = request.data['completed']
    print(f"Setting activity {activity_id} to completed={completed}")

    activity.completed = completed
    activity.save()

    return Response({'activity_id': activity_id, 
                     'completed': activity.completed})

##############################################################################

url_patterns = [
    re_path(r'^member/(?P<pk>[0-9]+)?$', MemberList.as_view()),

    re_path(r'^members/ready/', MemberReadyList.as_view()),
    re_path(r'^members/not_ready/', MemberNotReadyList.as_view()),
    re_path(r'^members/has_card/', MemberWithCardList.as_view()),
    re_path(r'^members/double_booked/', DoubleBookedMembersList.as_view()),
    re_path(r'^members/completions/', CompletionsList.as_view()),
    re_path(r'^members/set_completed/(?P<activity_id>\d+)', set_completed),

    re_path(r'^member/((?P<member_id>\d+)/)?license/(?P<id>[0-9]+)?$', MemberLicenseList.as_view()),
    re_path(r'^member/((?P<member_id>\d+)/)?driver/(?P<id>[0-9]+)?$', MemberDriverList.as_view())

]
