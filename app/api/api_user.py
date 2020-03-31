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

from app import models
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
    queryset = User.objects.select_related('member').fetch_releated('member__proxy')
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.UserWithProxiesSerializer

    def get_queryset(self):        
        return self.queryset.filter(
            Q(id=self.request.user.id) | Q(member__proxy__user=self.request.user))

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def check_object_permissions(self, request, obj):
        if request.method.upper() == 'PATCH' and \
            (request.user.id != obj.id or
                (obj.member.proxy.user.id == request.user.id and not obj.password)):
            raise PermissionDenied(
                "Can only PATCH self, or proxies who haven't logged in themselves yet")

        return super().check_object_permissions(request, obj)



class IsLoggedIn(generics.GenericAPIView, mixins.RetrieveModelMixin):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)
    read_only = True
    serializer_class = NotificationDataSerializer

    def get(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_object(self):
        if self.request.user.is_authenticated:
            member = models.Member.objects.get(user=self.request.user)
        else:
            member = None

        return NotificationData(member)


##############################################################################


url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    re_path(r'^user/(?P<pk>[0-9]+)?$', UserList.as_view()),
]
