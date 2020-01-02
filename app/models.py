"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.apps import apps
from django.core.mail import mail_managers, send_mail, send_mass_mail
from django.conf import settings

import logging
import datetime

from app import events

logger = logging.getLogger(__name__)

class RuleViolationException(BaseException):
    '''thrown when a model change violates rules set by the club'''
    pass

# Create your models here, these will be tables in the SQL database.

class Member(models.Model):
    '''A club member, extensions to user object'''
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    phone_number = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    comment = models.TextField(blank=True)
    membercard_number = models.CharField(max_length=20, blank=True)

    @property
    def fullname(self):
        return f"{self.user.first_name} {self.user.last_name}"        

    @property
    def email(self):
        return self.user.email

    class Meta:
        order_with_respect_to = 'user'
        verbose_name = 'Medlem'
        verbose_name_plural = 'Medlemmar'

    def __str__(self):
        return f"{self.fullname} ({self.user.email})"

@receiver(post_save, sender=User)
def user_saved(sender, instance, created, **kwargs):
    if created:
        instance.member = Member.objects.create(user=instance)
        instance.email = instance.username
        instance.save()
    elif instance.username != instance.email:
        instance.username = instance.email
        instance.save()

    instance.member.save()

@receiver(post_save, sender=Member)
def member_saved(sender, instance, created, **kwargs):
    if created:
        events.new_user_created(instance)


class Attachment(models.Model):
    uploader = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField()
    comment = models.TextField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Attachment, self).save(*args, **kwargs)


class EventType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)

    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)

    fee_reimbursed = models.BooleanField(default=False)
    food_included = models.BooleanField(default=False)
    rental_kart = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Aktivitetstyp'
        verbose_name_plural = 'Aktivitetstyper'


class Event(models.Model):
    '''Groups a set of activities'''
    name = models.CharField(max_length=40)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    comment = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    type = models.ForeignKey(
        EventType, on_delete=models.SET_NULL, null=True, blank=True)
    coordinators = models.ForeignKey(
        Member, on_delete=models.SET_NULL, null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    cancelled = models.BooleanField(default=False)

    @property
    def activities_count(self):
        return self.activities.count()
    @property
    def activities_available_count(self):
        return self.activities.filter(assigned=None).count()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['start_date', 'end_date', 'name']
        verbose_name = 'Aktivitet'
        verbose_name_plural = 'Aktiviteter'

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Event, self).save(*args, **kwargs)


class ActivityType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Uppgiftstyp'
        verbose_name_plural = 'Uppgiftstyper'


class Activity(models.Model):
    '''A specific activity on a given day, can be assigned to a user'''
    name = models.CharField(max_length=128)
    type = models.ForeignKey(
        ActivityType, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='activities')

    assigned = models.ForeignKey(
        Member, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    comment = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)

    completed = models.BooleanField(default=None, null=True, blank=True)
    cancelled = models.BooleanField(default=False)

    @property
    def date(self):
        return self.event.start_date

    @property
    def bookable(self):
        config = apps.get_app_config('app')
        max_date = config.LATEST_BOOKABLE_DATE
        now = datetime.date.today()
        return self.event.start_date >= now and self.event.start_date <= max_date

    @property
    def delist_requested(self):
        return self.delist_requests.filter(member=self.assigned).count() > 0

    class Meta:
        ordering = ['start_time', 'end_time', 'name']
        verbose_name = 'Uppgift'
        verbose_name_plural = 'Uppgifter'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if 'assigned' in kwargs:
            self.assigned_at = datetime.date.today()

            if kwargs['assigned'] is not None and not self.bookable:
                raise Exception("Cannot assign non-bookable Activity")

        super().save(*args, **kwargs)


class ActivityDelistRequest(models.Model):
    '''request from a user to delist from an activity'''

    member = models.ForeignKey(Member, on_delete=models.CASCADE,
                               related_name='delist_request_members')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE,
                                 related_name='delist_requests')
    reason = models.TextField(blank=True)
    approved = models.BooleanField(default=None, null=True, blank=True)
    approver = models.ForeignKey(Member, on_delete=models.SET_NULL,
                                 blank=True, null=True, related_name='approvers')                                     
    reject_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.member}: {self.activity.name} ({self.activity.event.start_date})"

    class Meta:
        ordering = ['activity__date', 'activity__assigned']
        unique_together = [['member', 'activity']]
        verbose_name = "Avbokningsbegäran"
        verbose_name_plural = "Avbokningsbegäranden"

    def save(self, *args, **kwargs):
        if not self.id:
            config = apps.get_containing_app_config('app')

            # TODO: fix & test this logic

            booked_count = Activity.objects.filter(
                assigned=self.member).count()
            delist_req_count = ActivityDelistRequest.objects.filter(
                member=self.member, approved=None).count()

            if booked_count - delist_req_count - 1 < config.MIN_ACTIVITY_SIGNUPS:
                raise RuleViolationException(
                    f'Cannot create delist request when member would be booked for less than' + 
                     f'{config.MIN_ACTIVITY_SIGNUPS} activities if all outstanding request(s) are approved.')

        super().save(*args, **kwargs)

@receiver(post_save, sender=ActivityDelistRequest)
def save_activity_delist_request(sender, instance, created, **kwargs):
    if instance.activity.assigned is None:
        return

    if instance.approved is True and instance.activity.assigned == instance.member:
        logger.info(f"Removing {instance.member} from {instance.activity}")
        instance.activity.assigned = None
        instance.activity.save()
        events.adr_approved(instance)
    elif instance.approved is False:
        logger.info(f"Rejecting {instance.member} delist request from {instance.activity}")
        events.adr_rejected(instance)

class FAQ(models.Model):
    question = models.CharField(max_length=256)
    answer = models.TextField()

    class Meta:
        verbose_name = 'Vanlig fråga'
        verbose_name_plural = 'Vanliga frågor'

    def __str__(self):
        return f"{self.question[:40]}..."