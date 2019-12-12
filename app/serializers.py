from rest_framework import serializers
from app.models import *

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ('fullname', 'phone_number', 'id', 'email')


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()
    coordinators = MemberSerializer()

    class Meta:
        model = Event
        fields = '__all__'


class ActivityTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityType
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer(required=False)
    event = EventSerializer(required=False)
    assigned = MemberSerializer(required=False)

    class Meta:
        model = Activity
        fields = '__all__'

class EventActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer(required=False)
    assigned = MemberSerializer(required=False)

    class Meta:
        model = Activity
        fields = '__all__'

class ActivityDelistRequestSerializer(serializers.ModelSerializer):
    member = MemberSerializer(required=False)
    activity = ActivityTypeSerializer(required=False)
    approver = MemberSerializer(required=False)

    class Meta:
        model = ActivityDelistRequest
        fields = '__all__'

