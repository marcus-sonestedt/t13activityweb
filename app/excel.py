import openpyxl
import logging

from django.core.exceptions import PermissionDenied
from app.models import *

logger = logging.getLogger(__name__)

months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

def importDataFromExcel(file, year=2019):
    wb = openpyxl.load_workbook(file, data_only=True, read_only=True)
    sheet = wb._sheets[0]

    events = dict()
    activityTypes = dict()
    n = 0

    event = None

    for cols in sheet.rows:
        n += 1
        if n < 6: continue

        if cols[0].value is not None:
            event_name = f"{cols[0].value} vecka {cols[1].value}"
            date = cols[2].value.replace(year=year)
            event = events.get((event_name,date))
            if event is None:
                logger.info(f"Event {event_name} {date}")
                try:
                    event = Event.objects.get(name=event_name,
                start_date=date)
                except Event.DoesNotExist:
                    event = Event(name=event_name, start_date=date, end_date=date)
                    event.save()

                events[event_name] = event

        at_name = cols[5].value
        at = activityTypes.get(at_name)
        if at is None:
            logger.info(f"Activity Type: {at_name}")
            try:
                at = ActivityType.objects.get(name=at_name)
            except ActivityType.DoesNotExist:
                at = ActivityType(name=at_name)
                at.save()
            activityTypes[at_name] = at

        activity = Activity(name=f"{at_name} {event_name}", event=event, type=at)

        interval = cols[4].value.replace('—', '-').replace('–', '-') \
            .replace(' ','').replace('.',':')

        try:
            (start_time, end_time) = interval.split('-')
        except ValueError as e:
            logger.error(e)
            logger.error(interval)

        logger.info(f'{activity.name} {interval}')
        (sh,sm) = start_time.split(':')
        (eh,em) = end_time.split(':')
        activity.start_time = datetime.time(hour=int(sh), minute=int(sm))
        activity.end_time = datetime.time(hour=int(eh), minute=int(em))
        activity.save()

