from django.core.management.base import BaseCommand, CommandError
from app.models import Activity, Event

class Command(BaseCommand):
    help = 'Clears all activities'

    def handle(self, *args, **options):
        Activity.objects.all().delete()
        Event.objects.all().delete()
