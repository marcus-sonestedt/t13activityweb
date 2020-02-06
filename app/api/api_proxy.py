import datetime
import logging

from django.conf import settings
from django.urls import path, re_path
from django.apps import apps
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound, HttpResponse
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


class MyProxiesList(generics.ListAPIView):
    queryset = models.Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.MemberSerializer

    def get_queryset(self):
        return self.queryset.filter(proxy__user=self.request.user.id)

class ProxyForList(generics.ListAPIView):
    queryset = models.Member.objects.select_related('user')
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.MemberSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user, proxies__contain=self.kwargs['member_id'])

class ProxyConnector(generics.GenericAPIView):
    '''connects members as proxies'''
    permission_classes = [IsAuthenticated]

    def put(self, request, proxy_id):
        try:
            proxy = models.Member.objects.get(id=proxy_id)
        except models.Member.DoesNotExist:
            return HttpResponseNotFound()

        # TOOD: Create proxy-request and have other user confirm first!
        #member = models.Member.get(user_id=self.request.user.id)
        #member.proxies.add(proxy)
        #member.save()
        #return HttpResponse("Created")

        return HttpResponseForbidden("Not yet implemented")

    def delete(self, request, proxy_id):
        try:
            proxy = models.Member.get(id=proxy_id)
        except models.Member.DoesNotExist:
            return HttpResponseNotFound()

        member = models.Member.get(user_id=self.request.user.id)
        member.proxies.remove(proxy)
        member.save()

        return HttpResponse("Deleted")



class ActivityByProxyEnlister(generics.GenericAPIView):
    '''enlists on an activity via a proxy'''

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
    re_path(r'^proxy/for/(?P<member_id>[0-9]+)$', ProxyForList.as_view()),
    re_path(r'^proxy/my/$', MyProxiesList.as_view()),
    re_path(r'^proxy/activity/(?P<activity_id>[0-9]+)/(?P<proxy_id>[0-9]+)$',
            ActivityByProxyEnlister.as_view()),
]
