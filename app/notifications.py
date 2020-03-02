from django.apps import apps
from rest_framework import serializers as drf_serializers

from app import models, serializers

app_config = apps.get_app_config('app')


class Notification():
    def __init__(self, message: str, link: str):
        self.message = message
        self.link = link


class NotificationData():
    def __init__(self, member: models.Member):
        self.isLoggedIn = member is not None

        if not self.isLoggedIn:
            return

        self.member = member
        self.minSignups = int(app_config.MIN_ACTIVITY_SIGNUPS)

        self.isLoggedIn = True
        self.isStaff = self.member.user.is_staff

        self.memberId = member.id
        self.userId = member.user_id
        self.fullname = member.fullname

        self.hasMemberCard = member.membercard_number != None and member.membercard_number != ''
        self.hasProxies = member.proxies.all().exists()

        self.count_badges()
        self.compute_notifications()

    def count_badges(self):
        self.completedTasks = self.member.completed_weight
        self.bookedTasks = self.member.booked_weight

        self.myDelistRequests = models.ActivityDelistRequest.objects.filter(
                member=self.member, approved=None).count()

        if self.isStaff:
            self.unansweredDelistRequests = models.ActivityDelistRequest.objects \
                .filter(approved=None) \
                .exclude(member=self.member).count()
        else:
            self.unansweredDelistRequests = None

    def compute_notifications(self):
        self.notifications = []

        verified = self.member.phone_verified and self.member.email_verified

        if self.member.phone_number and not self.member.phone_verified:
            self.notifications.append(Notification(
                'Ditt telefonnummer behöver verifieras! Klicka här för att åtgärda.',
                '/frontend/verify/phone'))

        if not self.member.email_verified:
            self.notifications.append(Notification(
                'Din emailaddress behöver verifieras! Klicka här för att åtgärda.',
                '/frontend/verify/email'))

        if self.bookedTasks < self.minSignups:
            self.notifications.append(Notification(
                f'Du behöver boka dig på {self.minSignups-self.member.booked_weight} uppgift(er) till för att kunna hämta ut ditt guldkort.',
                '/frontend/home?tab=upcoming-events'))

        elif not self.hasMemberCard and verified:
            self.notifications.append(Notification(
                'Du kan hämta ut ditt guldkort på hyrkarten / kansliet!',
                'http://www.team13.se/kontakta-oss'))


class NotificationSerializer(drf_serializers.Serializer):
    link = drf_serializers.CharField()
    message = drf_serializers.CharField()


class NotificationDataSerializer(drf_serializers.Serializer):
    isLoggedIn = drf_serializers.BooleanField()

    notifications = NotificationSerializer(many=True, required=False)
    member = serializers.MemberReadySerializer(required=False)

    minSignups = drf_serializers.IntegerField(required=False)

    isStaff = drf_serializers.BooleanField(required=False)
    hasProxies = drf_serializers.BooleanField(required=False)

    memberId = drf_serializers.IntegerField(required=False)
    userId = drf_serializers.IntegerField(required=False)
    fullname = drf_serializers.CharField(required=False)

    hasMemberCard = drf_serializers.BooleanField(required=False)
    completedTasks = drf_serializers.IntegerField(required=False)
    bookedTasks = drf_serializers.IntegerField(required=False)

    myDelistRequests = drf_serializers.IntegerField(required=False)
    unansweredDelistRequests = drf_serializers.IntegerField(required=False)
