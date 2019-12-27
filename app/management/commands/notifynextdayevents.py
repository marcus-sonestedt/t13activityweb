import datetime, logging

from django.core.management.base import BaseCommand
from django.conf import settings

from app.events import notify_upcoming_activity
from app.models import Event, Activity

log = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Notify users assigned to activitites that occur in x days '

    def add_arguments(self, parser):
        parser.add_argument('days', type=str, help="days to notify")
        parser.add_argument('--send', help="Test-only", action='store_true')

    def handle(self, *args, **options):
        date = datetime.date.today() \
            + datetime.timedelta(days=int(options['days']))

        events = Event.objects.filter(
            start_date__year=date.year,
            start_date__month=date.month,
            start_date__day=date.day)

        activities = Activity.objects \
            .filter(event__in=[e.id for e in events]) \
            .select_related('assigned', 'assigned__user')

        self.stdout.write(f"Found {len(activities)} activities that occur on {date}")

        if not options['send']:
            for a in activities:
                self.stdout.write("  " + a.name)

            self.stdout.write("Not sending anything, need --send arg")
            return

        err = False
        for a in activities:
            try:
                notify_upcoming_activity(a)
            except:
                err = True
                self.stderr.write(f"ERROR: Failed to notify for {a}", exc_info=True)

        if err:
            self.stderr.write("FAILURE (-ISH, maybe)")
        else:
            self.stdout.write("SUCCESS")
            

