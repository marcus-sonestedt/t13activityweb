from django.contrib.auth.models import User
from rest_framework import serializers
from app import models
from app.models import Attachment, Member, Event, EventType, Activity, \
    ActivityType, ActivityDelistRequest, FAQ


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('uploader', 'comment', 'created')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name')


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ('fullname', 'phone_number', 'id', 'email',
                  'phone_verified', 'email_verified', 'user_id')


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()
    coordinators = MemberSerializer(many=True)

    class Meta:
        model = Event
        fields = [x.name for x in Event._meta.get_fields()] + \
            ['has_bookable_activities']


class ActivityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityType
        fields = ('name', 'description', 'image', 'id')


class EventActivitySerializer(serializers.ModelSerializer):
    '''serializer used when fetching tasks for an event'''
    type = ActivityTypeSerializer(required=False)
    assigned = MemberSerializer(required=False)
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")
    bookable = serializers.BooleanField()

    class Meta:
        model = Activity
        fields = [x.name for x in Activity._meta.get_fields()] + \
            ['bookable', 'delist_requested']


class ActivitySerializer(EventActivitySerializer):
    '''serializer used when fetching stand-alone tasks'''
    event = EventSerializer(required=False)


class ActivityDelistRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityDelistRequest
        fields = '__all__'


class ActivityDelistRequestDeepSerializer(serializers.ModelSerializer):
    member = MemberSerializer()
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
