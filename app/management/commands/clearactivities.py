from django.core.management.base import BaseCommand, CommandError
from app.models import Activity, ActivityType, Event, EventType

class Command(BaseCommand):
    help = 'Clears all activities, events and types'

    def handle(self, *args, **options):
        Activity.objects.all().delete()
        Event.objects.all().delete()
        ActivityType.objects.all().delete()
        EventType.objects.all().delete()
