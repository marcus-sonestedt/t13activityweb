from rest_framework import serializers
from app.models import *


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()

    class Meta:
        model = Event
        fields = '__all__'

class ActivityTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityType
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer()
    event = EventSerializer()

    class Meta:
        model = Activity
        fields = '__all__'
