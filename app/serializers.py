from rest_framework import serializers
from app.models import Attachment, Member, Event, EventType, Activity, ActivityType, ActivityDelistRequest

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('uploader', 'comment', 'created')


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
        fields = ('name', 'description', 'image')

class ActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer(required=False)
    event = EventSerializer(required=False)
    assigned = MemberSerializer(required=False)
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = Activity
        fields = '__all__'

class EventActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer(required=False)
    assigned = MemberSerializer(required=False)
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M")

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

