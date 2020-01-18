"""
Definition of models.
"""

from django.db import models
from django.db.models import Sum
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
from django.db.models import Q

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

    email_verification_code = models.CharField(
        max_length=40, blank=True, null=True)
    email_verification_code_created = models.DateTimeField(
        null=True, blank=True)

    comment = models.TextField(blank=True)
    membercard_number = models.CharField(max_length=20, blank=True)

    def fullname(self):
        return f"{self.user.first_name} {self.user.last_name}"
    fullname.short_description = 'Namn'
    fullname = property(fullname)

    @property
    def email(self):
        return self.user.email

    class Meta:
        order_with_respect_to = 'user'
        verbose_name = 'Medlem'
        verbose_name_plural = 'Medlemmar'

    def __str__(self):
        return f"{self.fullname} ({self.email})"

    def task_summary(self):
        '''returns completed/booked activities for this year'''
        current_year = datetime.date.today().year
        current_activities = Activity.objects.filter(assigned=self,
                                                     event__start_date__year=current_year)
        booked_weight = current_activities.aggregate(Sum('weight'))['weight__sum']
        completed = current_activities.filter(completed=True).count()

        return f"{completed}/{booked_weight}"

    task_summary.short_description = 'Utförda/Bokade'
    task_summary = property(task_summary)


@receiver(post_save, sender=User)
def user_saved(sender, instance, created, **kwargs):
    if created:
        instance.member = Member.objects.create(user=instance)
        instance.email = instance.username
        instance.save()
    elif instance.username != instance.email or 'email' in kwargs:
        instance.username = instance.email
        instance.member.email_verified = False
        instance.save()

    instance.member.save()


@receiver(post_save, sender=Member)
def member_saved(sender, instance, created, **kwargs):
    if created:
        events.new_user_created(instance)
    elif 'phone_number' in kwargs:
        instance.phone_verified = False
        instance.save()


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

    class Meta:
        verbose_name = 'Bifogad fil'
        verbose_name_plural = 'Bifogade filer'


class EventType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)

    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)

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

    coordinators = models.ManyToManyField(Member, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    cancelled = models.BooleanField(default=False, verbose_name='Inställd')

    def date(self):
        if self.start_date == self.end_date:
            return str(self.start_date)
        else:
            return f'{self.start_date} - {self.end_date}'
    
    date.short_description = 'Datum'
    date = property(date)

    def activities_count(self):
        return self.activities.count()
    
    activities_count.short_description = 'Uppgifter'
    activities_count = property(activities_count)

    def activities_available_count(self):
        today = datetime.date.today()
        return self.activities.filter(assigned=None) \
            .filter(Q(earliest_bookable_date__gte=today) | Q(earliest_bookable_date=None)) \
            .count()
    
    activities_available_count.short_description = 'Lediga uppgifter'
    activities_available_count = property(activities_available_count)

    def has_bookable_activities(self):
        if self.end_date < datetime.date.today():
            return False
        return bool(self.activities_available_count)
    
    has_bookable_activities.boolean = True
    has_bookable_activities = property(has_bookable_activities)

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

    fee_reimbursed = models.BooleanField(default=False)
    food_included = models.BooleanField(default=False)
    rental_kart = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Uppgiftstyp'
        verbose_name_plural = 'Uppgiftstyper'


class Activity(models.Model):
    '''A specific activity on a given day, can be assigned to a user'''
    name = models.CharField(max_length=128)
    type = models.ForeignKey(
        ActivityType, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name='activities')

    attachments = models.ManyToManyField(Attachment, blank=True)

    assigned = models.ForeignKey(
        Member, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    comment = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)

    confirmed = models.BooleanField(default=False, verbose_name='Påminnelse bekräftad')
    completed = models.BooleanField(default=None, null=True, blank=True, verbose_name='Utförd')
    cancelled = models.BooleanField(default=False, verbose_name='Inställd')

    earliest_bookable_date = models.DateField(null=True, blank=True)

    @property
    def date(self):
        return self.event.start_date

    @property
    def bookable(self):
        now = datetime.date.today()
        return self.event.end_date >= now and \
            (self.earliest_bookable_date is None or now >= self.earliest_bookable_date)

    @property
    def delist_requested(self):
        return self.delist_requests.filter(member=self.assigned).count() > 0

    class Meta:
        ordering = ['start_time', 'end_time', 'name']
        verbose_name = 'Uppgift'
        verbose_name_plural = 'Uppgifter'
        indexes = [
            models.Index(fields=['assigned']),
            models.Index(fields=['event']),
            models.Index(fields=['event', 'assigned'])
        ]

    def __str__(self):
        return f"{self.event.name} - {self.name}"

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
        verbose_name = "Avbokning"
        verbose_name_plural = "Avbokningar"
        indexes = [
            models.Index(fields=['member']),
            models.Index(fields=['activity']),
            models.Index(fields=['member', 'activity']),
            models.Index(fields=['approver']),
        ]


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
        logger.info(
            f"Rejecting {instance.member} delist request from {instance.activity}")
        events.adr_rejected(instance)


class FAQ(models.Model):
    question = models.CharField(max_length=256)
    answer = models.TextField()
    order = models.IntegerField(default=100)

    def answer_short(self):
        return self.answer[:40] + '...'
    answer_short.short_description = 'Svar'

    class Meta:
        verbose_name = 'Vanlig fråga'
        verbose_name_plural = 'Vanliga frågor'
        ordering = ['order', 'question']

    def __str__(self):
        if len(self.question) > 40:
            return f"{self.question[:37]} ..."

        return self.question


class InfoText(models.Model):
    key = models.CharField(max_length=32, primary_key=True)
    content = models.TextField()

    class Meta:
        verbose_name = 'Informationstext'
        verbose_name_plural = 'Informationstexter'
        unique_together = ['key']

    def __str__(self):
        return self.key
