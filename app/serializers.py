from datetime import datetime, date
from django.contrib.auth.models import User
from rest_framework import serializers
from app import models
from app.models import Attachment, Member, Event, EventType, Activity, \
    ActivityType, ActivityDelistRequest, FAQ


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')

class UserWithProxiesSerializer(serializers.ModelSerializer):
    proxy = UserSerializer(required=False)
    proxies = UserSerializer(required=False, many=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'proxy', 'proxies')



class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['fullname', 'phone_number', 'id', 'email',
                  'phone_verified', 'email_verified', 'user_id']


class MemberReadySerializer(MemberSerializer):
    booked_weight_year = serializers.IntegerField(required=False)    
    booked_weight  = serializers.IntegerField(required=False)    

    class Meta:
        model = Member
        fields = MemberSerializer.Meta.fields + ['booked_weight_year', 'membercard_number', 'booked_weight']


class MemberPatchSerializer(serializers.Serializer):
    fullname = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)
    membercard_number = serializers.CharField(required=False, allow_blank=True)

class AttachmentSerializer(serializers.Serializer):
    uploader = UserSerializer()

    class Meta:
        model = Attachment
        fields = '__all__'



class EventTypeSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True)

    class Meta:
        model = EventType
        fields = '__all__'


class EventPublicSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()

    class Meta:
        model = Event
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()
    coordinators = MemberSerializer(many=True)

    class Meta:
        model = Event
        fields = [x.name for x in Event._meta.get_fields()] + \
            ['has_bookable_activities', 'activities_count', 'activities_available_count']


class ActivityTypeSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True)

    class Meta:
        model = ActivityType
        fields = '__all__'


class ActivityDelistRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityDelistRequest
        fields = '__all__'


class EventActivitySerializer(serializers.ModelSerializer):
    '''serializer used when fetching tasks for an event'''
    type = ActivityTypeSerializer(required=False)
    assigned = MemberSerializer(required=False)
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")
    bookable = serializers.BooleanField()
    active_delist_request = ActivityDelistRequestSerializer(required=False)

    class Meta:
        model = Activity
        fields = [x.name for x in Activity._meta.get_fields()] + \
            ['bookable',  'active_delist_request']


class ActivitySerializer(EventActivitySerializer):
    '''serializer used when fetching stand-alone tasks'''
    event = EventSerializer(required=False)


class ActivityDelistRequestDeepSerializer(ActivityDelistRequestSerializer):
    member = MemberReadySerializer()
    activity = ActivitySerializer()
    approver = MemberSerializer(required=False)

    class Meta:
        model = ActivityDelistRequest
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'


class InfoTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InfoText
        fields = '__all__'
