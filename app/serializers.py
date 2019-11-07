from rest_framework import serializers
from app.models import *


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ('name', 'description', 'image')

class EventSerializer(serializers.ModelSerializer):
    type = EventTypeSerializer()

    class Meta:
        model = Event
        fields = ('name','start_date','end_date','type')

class ActivityTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityType
        fields = ('name', 'description', 'image')

class ActivitySerializer(serializers.ModelSerializer):
    type = ActivityTypeSerializer()
    event = EventSerializer()

    class Meta:
        model = Activity
        fields = '__all__'
