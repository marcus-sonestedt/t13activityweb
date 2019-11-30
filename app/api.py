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
from django.http import HttpResponseBadRequest


class ClearAuthToken(ObtainAuthToken):
    permission_classes = [IsAuthenticated]
    schema = None

    def post(self, reque8st):
        deleted, _ = Token.objects.delete(user=self.serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_404_NOT_FOUND)
        return Response("bye")


class MyActivities(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'event')
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        member = Member.objects.get(user__username=self.request.user)

        return self.queryset \
            .filter(assigned=member) \
            .values()


class EventList(generics.ListAPIView):
    queryset = Event.objects.select_related('type')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset

        return self.queryset.filter(id=id)


class UpcomingEventList(generics.ListAPIView):
    queryset = Event.objects \
                    .filter(start_date__gte=datetime.now()) \
                    .select_related('type')[:10]
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True


class IsLoggedIn(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    renderer_classes = (renderers.JSONRenderer,)

    def get(self, request, format=None):
        try:
            member = Member.objects.get(user=request.user.id)
        except Member.DoesNotExist:
            member = None

        user_id = request.user.id if request.user.is_authenticated else None

        return Response({
            'isLoggedIn': request.user.is_authenticated,
            'isStaff': request.user.is_staff,
            'userId': user_id,
            'memberId': member.id if member else None,
            'fullname' : member.fullname if member else None,
        })


class EventActivities(generics.ListAPIView):
    queryset = Activity.objects.select_related('type', 'assigned')
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = EventActivitySerializer

    def get_queryset(self):
        try:
            id = self.kwargs['event_id']
        except KeyError:
            return self.queryset.none()

        return self.queryset.filter(event=id)

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


class EventTypeList(generics.ListAPIView):
    queryset = EventType.objects
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset

        return self.queryset.filter(id=id)


class ActivityTypeList(generics.ListAPIView):
    queryset = ActivityType.objects
    serializer_class = ActivityTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    read_only = True

    def get_queryset(self):
        try:
            id = self.kwargs['id']
        except KeyError:
            return self.queryset

        return self.queryset.filter(id=id)
