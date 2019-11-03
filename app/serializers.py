from rest_framework import serializers
from app.models import *

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class ActivityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityType
        fields = ('name', 'description', 'image')

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('name','start_date','end_date','comment','image','coordinators')
