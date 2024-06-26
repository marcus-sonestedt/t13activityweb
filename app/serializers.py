from datetime import datetime, date
from django.contrib.auth.models import User
from rest_framework import serializers
from app import models
from app.models import Attachment, Member, Event, EventType, Activity, \
    ActivityType, ActivityDelistRequest


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

class LicenseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.LicenseType
        fields = '__all__'

class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.License
        fields = '__all__'

class LicensePatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.License
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Driver
        fields = '__all__'

class CarClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CarClass
        fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
    license_set = LicenseSerializer(required=False, many=True)
    driver_set = DriverSerializer(required=False, many=True)

    class Meta:
        model = Member
        fields = ['fullname', 'phone_number', 'id', 'email',
                  'phone_verified', 'email_verified', 'user_id',
                  'license_set', 'driver_set']


class CreateMemberSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField()
    email = serializers.EmailField()

    class Meta:
        model = Member
        fields = ['phone_number', 'comment', 'fullname', 'email']


class MemberBookWeightSerializer(MemberSerializer):
    booked_weight_year = serializers.IntegerField(required=False)
    booked_weight = serializers.IntegerField(required=False)

    class Meta:
        model = Member
        fields = MemberSerializer.Meta.fields + ['booked_weight_year',
                                                 'membercard_number', 'booked_weight']

class MemberPatchSerializer(serializers.Serializer):
    fullname = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)
    membercard_number = serializers.CharField(required=False, allow_blank=True)
    licenses = LicensePatchSerializer(required=False, many=True)


class AttachmentSerializer(serializers.ModelSerializer):
    uploader = UserSerializer()

    class Meta:
        model = Attachment
        fields = '__all__'


class EventTypeSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True)

    class Meta:
        model = EventType
        fields = '__all__'


class EventTypeBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name']


class EventPublicSerializer(serializers.ModelSerializer):
    type = EventTypeBriefSerializer()

    class Meta:
        model = Event
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()
    coordinators = MemberSerializer(many=True)
    current_user_assigned = serializers.BooleanField(required=False)

    class Meta:
        model = Event
        fields = [x.name for x in Event._meta.get_fields()] + \
            ['has_bookable_activities', 'activities_count',
             'activities_available_count', 'current_user_assigned']


class EventListSerializer(serializers.ModelSerializer):
    type = EventTypeBriefSerializer()
    current_user_assigned = serializers.BooleanField(required=False)
    has_bookable_activities = serializers.BooleanField(required=False)

    class Meta:
        model = Event
        fields = [x.name for x in Event._meta.get_fields() if x.name not in ['coordinators']] + \
            ['has_bookable_activities', 'current_user_assigned']


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
    event = EventListSerializer(required=False)


class ActivityTypeBriefSerializer(EventActivitySerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']


class EventListADRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [x.name for x in Event._meta.get_fields() if x.name not in [
            'type', 'attachments', 'coordinators', 'activities']]


class ActivityADRSerializer(EventActivitySerializer):
    '''serializer used when fetching stand-alone tasks'''
    event = EventListADRSerializer(required=False)
    type = ActivityTypeBriefSerializer()

    class Meta:
        model = Activity
        fields = [x.name for x in Activity._meta.get_fields() if x.name != 'attachments']


class ActivityDelistRequestDeepSerializer(ActivityDelistRequestSerializer):
    member = MemberBookWeightSerializer()
    activity = ActivityADRSerializer()
    approver = MemberSerializer(required=False)

    class Meta:
        model = ActivityDelistRequest
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FAQ
        fields = '__all__'


class InfoTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InfoText
        fields = '__all__'


class LicenseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.LicenseType
        fields = '__all__'


class CarClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CarClass
        fields = '__all__'


class DoubleBookedSerializer(serializers.Serializer):
    assigned_id = serializers.CharField()
    assigned_fullname = serializers.CharField()
    event_id = serializers.CharField()
    event_name = serializers.CharField()
    activity_id = serializers.CharField()
    activity_name = serializers.CharField()
    activity_comment = serializers.CharField()


class CompletionSerializer(serializers.Serializer):
    assigned_id = serializers.CharField()
    assigned_fullname = serializers.CharField()
    event_id = serializers.CharField()
    event_name = serializers.CharField()
    activity_id = serializers.CharField()
    activity_name = serializers.CharField()
    completed = serializers.BooleanField()
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()


