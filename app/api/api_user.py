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
    serializer_class = MemberSerializer

    def get_queryset(self):
        if 'pk' in self.kwargs:
            return self.queryset.filter(id=self.kwargs['pk'])

        return self.queryset

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def check_object_permissions(self, request, obj):
        if request.method.upper() == 'PATCH' and request.user.member.id != obj.id:
            raise PermissionDenied("Can only PATCH self")

        return super().check_object_permissions(request, obj)


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)
    read_only = True

    @method_decorator(cache_page(60))
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

##############################################################################


url_patterns = [
    path('login', obtain_auth_token),
    path('logout', ClearAuthToken.as_view()),
    path('isloggedin', IsLoggedIn.as_view()),

    re_path(r'^user/(?P<pk>[0-9]+)?', UserList.as_view()),
    re_path(r'^member/(?P<pk>[0-9]+)?', MemberList.as_view()),
]
