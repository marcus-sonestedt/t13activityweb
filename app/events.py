import logging

from django.conf import settings
from django.core.mail import mail_managers, send_mail, send_mass_mail

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

        Go to https://macke.eu.pythonanywhere.com/admin/auth/user/{user.id}/change/'
        to give them access, i.e. at least add them to the 'T13 Members'
        group if they are a legitimate member of the club.

        See also https://macke.eu.pythonanywhere.com/admin/app/member/{member.id}/change/
        to check their membership status & data.

        Best regards,
        /The Team13 website
        ''')


def adr_approved(adr):
    log.info(f"ADR {adr} has been approved, sending email")

    send_mail('Avbokning godkänd',
        f'''Hej {adr.member.fullname}

        Din önskan om avbokning från {adr.activity}
        har blivit godkänd av {adr.approver.fullname}.

        mvh
        /Team13 aktivitetswebb''',
        settings.DEFAULT_FROM_EMAIL,
        [adr.member.user.email])

    sms_target = adr.member.phone_number

    if sms_target is None:
        log.warning(f"No phone_number set for {adr.member}")
    else:
        log.info(f"Sending SMS to {sms_target}")
        sms_client().messages.create(
            body=f"Din begäran om avbokning av {adr.activity} har blivit godkänd. mvh /Team13",
            from_=settings.SMS_FROM_NUMBER,
            to=sms_target)

def adr_rejected(adr):
    log.info(f"ADR {adr} has been rejected, sending email")

    send_mass_mail('Avbokning ej godkänd',
            f'''Hej {adr.member.fullname},

            Din önskan om avbokning från {adr.activity}
            har tyvärr blivit avvisad av {adr.approver.fullname} ({adr.approver.user.email})
            med följande meddelande:\n\n"{adr.reject_reason}"

            Vänligen tag kontakt om du har frågor.

            mvh
            /Team13 aktivitetswebb''',
            settings.DEFAULT_FROM_EMAIL,
            [adr.member.user.email, adr.approved_by.user.email])

    sms_target = adr.member.phone_number

    if sms_target is None:
        log.warning(f"No phone_number set for {adr.member}")
    else:
        log.info(f"Sending SMS to {sms_target}")
        sms_client().messages.create(
            body=f"Hej! Din begäran om avbokning från {adr.activity} har tyvärr avvisats. mvh /Team13",
            from_=settings.SMS_FROM_NUMBER,
            to=sms_target)



def notify_upcoming_activity(activity):
    if activity.assigned is None:
        # TODO: Notify event coordinator/responsible with summary in this case?
        log.warning(f"Activity '{activity}' is not assigned, cannot notify")
        return

    log.info(f"Notifying {activity.assigned} that {activity} happens tomorrow")

    message = f'''Hej!

        Här kommer en påminnelse om att du är inbokad på uppgiften {activity}
        den {activity.date} mellan {activity.start_time} och {activity.end_time}.

        mvh /Team13'''

    send_mail(f"Påminnelse om {activity}",
        message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[activity.assigned.user.email])

    sms_target = activity.assigned.phone_number

    if sms_target is None:
        log.warning(f"No phone_number set for {activity.member}")
    else:
        log.info(f"Sending SMS to {sms_target}")
        sms_client().messages.create(
            body=message,
            from_=settings.SMS_FROM_NUMBER,
            to=sms_target)


def send_verification_email(member):
    send_mail(subject='Team13 email verification',
        message=f'''Hej {member.fullname},

        Klicka på länken för att verifiera din emailadress:

        https://macke.eu.pythonanywhere.com/api/verify/email/check/{member.email_verification_code}

        mvh
        /Team13''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[member.email])