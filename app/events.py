import logging

from django.conf import settings
from django.core.mail import mail_managers, send_mail

from twilio.rest import Client as TwilioClient

log = logging.getLogger(__name__)

_sms_client = None

def sms_client():
    global _sms_client
    if _sms_client is None:
        _sms_client = TwilioClient(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN)

    return _sms_client


def new_user_created(member):
    user = member.user
    mail_managers(
        f'New user {user.username} registered at T13 web',
        f'''Hi,

        The user {member.fullname} (username: '{user.username}', email:
        {user.email}) just registered themselves on the Team 13 website.

        Go to https://eu.macke.pythonanywhere.com/admin/auth/user/{user.id}/change/'
        to give them access, i.e. at least add them to the 'T13 Members'
        group if they are a legitimate member of the club.

        See also https://macke.eu.pythonanywhere.com/admin/app/member/{member.id}/change/ to check their membership status & data.

        Best regards,
        /The Team13 website
        ''')


def adr_approved(adr):
    log.info("ADR {adr} is approved, sending email")

    send_mail("Avbokningsbegäran godkänd",
        f"Hej!\n\nBegäran att bli avbokad från {adr} har godkänts",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[adr.member.user.email])

    sms_target = adr.member.phone_number

    if sms_target is None:
        log.warning(f"No phone_number set for {adr.member}")
    else:
        log.info(f"Sending SMS to {sms_target}")
        sms_client().messages.create(
            body=f"Din begäran om avbokning av {adr} har blivit godkänd",
            from_=settings.TWILIO_SMS_FROM_NUMBER,
            to=sms_target)

def notify_activity_next_day(activity):
    if activity.assigned is None:
        # TODO: Notify event coordinator/responsible with summary in this case?
        log.warning(f"Activity '{activity}' is not assigned, cannot notify")
        return

    log.info(f"Notifying {activity.assigned} that {activity} happens tomorrow")

    send_mail(f"Påminnelse om {activity}",
        f'''Hej!\n
        Här kommer en liten påminnelse om att du är inbokad på uppgiften {activity} den {activity.date}
        mellan {activity.start_time} och {activity.end_time}.
        \nmvh /Team13''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[activity.assigned.user.email])

    sms_target = activity.assigned.phone_number

    if sms_target is None:
        log.warning(f"No phone_number set for {activity.member}")
    else:
        log.info(f"Sending SMS to {sms_target}")
        sms_client().messages.create(
            body=f"Hej! En påminnelse om att avbokning av {activity} har blivit godkänd. /Team13",
            from_=settings.TWILIO_SMS_FROM_NUMBER,
            to=sms_target)
