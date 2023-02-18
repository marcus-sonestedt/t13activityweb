
from app.models import Member
from django.urls import path
from oauth2_provider.contrib.rest_framework import OAuth2Authentication, TokenHasReadWriteScope
from oauth2_provider.views.generic import ProtectedResourceView
from rest_framework import generics
from rest_framework.response import Response as RestResponse
from app import serializers


class OAuthUserInfo(generics.GenericAPIView):
    authentication_classes = [OAuth2Authentication]
    permission_classes = [TokenHasReadWriteScope]

    def get_serializer_class(self):
        return serializers.MemberSerializer

    def get(self, request, *args, **kwargs):
        member = Member.objects.get(user=request.user)
        srz = serializers.MemberSerializer()
        return RestResponse(
            data={'member': srz.to_representation(member)}
        )


url_patterns = [
    path('v2/user', OAuthUserInfo.as_view()),
]
