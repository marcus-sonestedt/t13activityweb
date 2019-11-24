from datetime import datetime

from django.urls import path
from django.views.decorators.cache import cache_page, cache_control
from django.utils.decorators import method_decorator

from app.models import *
from app.serializers import *

from rest_framework.views import APIView
from rest_framework import generics, parsers, renderers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token, ObtainAuthToken
from rest_framework.authtoken.models import Token


class ClearAuthToken(ObtainAuthToken):
    permission_classes = [IsAuthenticated]
    schema = None

    def post(self, reque8st):
        deleted, _ = Token.objects.delete(user=self.serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_404_NOT_FOUND)
        return Response("bye")


class MyActivities(APIView):
    throttle_classes = ()
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.FormParser,
                      parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = ActivitySerializer

    def get(self, request, format=None):
        member = Member.objects.get(user__username=request.user)
        activitites = Activity.objects.filter(
            assigned=member).select_related('type', 'event')
        return Response(activitites.values())


class EventList(generics.ListAPIView):
    queryset = Event.objects.filter(start_date__gte=datetime.now()
                                    ).select_related('type')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


class UpcomingEventList(generics.ListAPIView):
    queryset = Event.objects.filter(start_date__gte=datetime.now()
                                    ).select_related('type')[:5]
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)

    def get(self, request, format=None):
        return Response({
            'isLoggedIn:':request.user.is_authenticated,
            'isStaff': request.user.is_staff
        })
