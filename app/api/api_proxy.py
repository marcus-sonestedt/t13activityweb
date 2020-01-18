import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.utils.decorators import method_decorator

from django.views.decorators.cache import cache_page, cache_control, never_cache
from django.views.decorators.vary import vary_on_cookie
from django.views.decorators.csrf import csrf_exempt

from rest_framework import authentication, generics, parsers, renderers, status, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view

import app.models as models
import app.serializers as serializers
import app.notifications as notifications

logger = logging.getLogger(__name__)


class ProxyList(generics.ListAPIView):
    queryset = models.Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.MemberSerializer

    def get_queryset(self):
        return self.queryset.filter(proxy=self.kwargs['member_id'])

    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ProxyConnector(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

class ProxyEnlister(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, activity_id, proxy_id):
        activity = models.Activityies.objects.get(id=activity_id)
        member = models.Member.objects.get(id=proxy_id)

        raise "Not implemented yet"

    def delete(self, request, activity_id, proxy_id):
        activity = models.Activityies.objects.get(id=activity_id)
        member = models.Member.objects.get(id=proxy_id)

        raise "Not implemented yet"


##############################################################################

url_patterns = [
    re_path(r'^proxy/(?P<proxy_id>[0-9]+)$', ProxyConnector.as_view()),
    re_path(r'^proxy/for/(?P<member_id>[0-9]+)$', ProxyList.as_view()),
    re_path(r'^proxy/activity/(?P<activity_id>[0-9]+)/(?P<proxy_id>[0-9]+)$',
            ProxyEnlister.as_view()),
]
