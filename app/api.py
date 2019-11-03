from django.urls import path

from app.models import *
from app.serializers import *

from rest_framework.views import APIView
from rest_framework import generics, parsers, renderers
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import obtain_auth_token

class ClearAuthToken(APIView):
    throttle_classes = ()
    permission_classes = (IsAuthenticated)
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        deleted, _ = Token.objects.delete(user=serializer.object['user'])
        if deleted == 0:
            return Response("not logged in?", status=status.HTTP_404_NOT_FOUND)
        return Response("bye")

class MyActivities(APIView):
    throttle_classes = ()
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def get(self, request, format=None):
        assert isinstance(request, HttpRequest)
        activitites = Activity.objects.filter(assigned=request.user)
        return Response(activitites)

class EventList(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated)
