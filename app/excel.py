import logging
import calendar
import locale
import datetime
import openpyxl

from django.core.exceptions import PermissionDenied
from app.models import Event, EventType, Activity, ActivityType, Member

logger = logging.getLogger(__name__)


def importDataFromExcel(file, year=2019):
    wb = openpyxl.load_workbook(file, data_only=True, read_only=True)
    sheet = wb._sheets[0]

    locale.setlocale(locale.LC_ALL, 'sv_SE')

    events = dict()
    eventTypes = dict()
    activityTypes = dict()
    n = 0
    et_name = None

    try:
        for cols in sheet.rows:
            n += 1
            if n <= 9:
                continue

            if cols[0].value is None and et_name is None:
                continue

            et_name = cols[0].value or et_name
            et = eventTypes.get(et_name)
            if et is None:
                #logger.info(f"Event type {et_name}")
                try:
                    et = EventType.objects.get(name=et_name)
                except EventType.DoesNotExist:
                    et = EventType(name=et_name)
                    et.save()
                eventTypes[et_name] = et

            if cols[2].value is None:
                break

            event_name = f"{et_name} vecka {cols[1].value}"            

            date = cols[2].value
            if year is not None:
                date = date.replace(year=year)

            event = events.get((event_name, date))

            if event is None:
                #logger.info(f"Event {event_name} {date}")
                try:
                    event = Event.objects.get(name=event_name,
                                              start_date=date, type=et)
                except Event.DoesNotExist:
                    event = Event(name=event_name, start_date=date,
                                  end_date=date, type=et)
                    event.save()

                    coord = cols[19].value

                    if coord is not None:
                        if ' ' in coord:
                            first, last = coord.split(' ', maxsplit=1)
                        else:
                            first = coord

                        try:
                            coordinator = Member.objects.get(
                                user__first_name=first, user__last_name=last)
                            event.coordinators.add(coordinator)
                        except Member.DoesNotExist:
                            print(
                                f"Failed to find member {coord} to use as coordinator for {event_name}")

                events[event_name] = event

            at_name = cols[5].value
            at = activityTypes.get(at_name)
            if at is None:
                #logger.info(f"Activity Type: {at_name}")
                try:
                    at = ActivityType.objects.get(name=at_name)
                except ActivityType.DoesNotExist:
                    at = ActivityType(name=at_name)
                    at.save()
                activityTypes[at_name] = at

            ebd = cols[18].value

            activity = Activity(
                name=f"{at_name} {calendar.day_name[date.weekday()]}", event=event, type=at,
                earliest_bookable_date=ebd)

            interval = cols[4].value.replace('—', '-').replace('–', '-') \
                .replace(' ', '').replace('.', ':')

            try:
                (start_time, end_time) = interval.split('-')
            except ValueError as e:
                logger.error(e)
                logger.error(interval)

            #logger.info(f'{activity.name} {interval}')
            (sh, sm) = start_time.split(':')
            (eh, em) = end_time.split(':')
            activity.start_time = datetime.time(hour=int(sh), minute=int(sm))
            activity.end_time = datetime.time(hour=int(eh), minute=int(em))

            activity.full_clean()
            activity.save()

        print(f'''Database row count:
            {EventType.objects.all().count()} event types
            {ActivityType.objects.all().count()} activity types
            {Event.objects.all().count()} events
            {Activity.objects.all().count()} activities'''
              .replace('    ', ' '))

    except:
        print(f"Error on row {n}")
        raise
