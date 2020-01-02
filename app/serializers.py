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
        fields = [x.name for x in Event._meta.get_fields()] + \
            ['activities_count', 'activities_available_count']


class ActivityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityType
        fields = ('name', 'description', 'image', 'id')


class EventActivitySerializer(serializers.ModelSerializer):
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
