from django.core.management.base import BaseCommand
from django.conf import settings

from app.events import sms_client

class Command(BaseCommand):
    help = 'Sends a test SMS'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str, help="Target phone number")
        parser.add_argument('--msg', type=str, help="Message")

    def handle(self, *args, **options):
        sms_target = options['to']
        msg = options.get('msg') or 'Test!'
        sms_client().messages.create(
            body=f"{msg} /Team13",
            from_=settings.SMS_FROM_NUMBER,
            to=sms_target)
