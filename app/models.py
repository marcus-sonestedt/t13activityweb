"""
Definition of models.
"""

from django.db import models
from django.db.models import Sum
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
from django.core.exceptions import ObjectDoesNotExist
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

class LicenseType(models.Model):
    class Meta:
        ordering = ['name']
        verbose_name = 'Licenstyp'
        verbose_name_plural = 'Licenstyper'

    name = models.CharField(verbose_name='Namn', max_length=64)
    description = models.TextField(verbose_name='Beskrivning')
    start_level = models.CharField(max_length=1, verbose_name='Första nivån')
    end_level = models.CharField(max_length=1,  verbose_name='Sista nivån')

class Member(models.Model):
    '''A club member or a member's proxy'''

    class Meta:
        order_with_respect_to = 'user'
        verbose_name = 'Medlem'
        verbose_name_plural = 'Medlemmar'
        indexes = [
            models.Index(fields=['user']),
        ]    

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    phone_number = models.CharField(max_length=20, blank=True,
                                    verbose_name="Telefonnnummer")
    phone_verified = models.BooleanField(default=False,
                                         verbose_name="Telefonnummer verifierat")
    email_verified = models.BooleanField(default=False,
                                         verbose_name="Emailaddress verifierad")

    email_verification_code = models.CharField(
        max_length=40, blank=True, null=True, verbose_name="Email-verifieringskod")
    email_verification_code_created = models.DateTimeField(
        null=True, blank=True, verbose_name="Email-verifieringskod skapad")

    comment = models.TextField(blank=True, verbose_name="Kommentar")
    membercard_number = models.CharField(max_length=64, blank=True,
                                         verbose_name="Guldkortsnummer")

    min_signup_bias = models.IntegerField(
        default=0, verbose_name="Justeringsfaktor för åtaganaden")

    # this points to the 'master', thus we are self
    # our proxies are the reverse relation lookup, i.e. 'proxies'
    proxy = models.ManyToManyField('self', blank=True, symmetrical=False,
                                   verbose_name="Huvudman", related_name='proxies')


    licenses = models.ManyToManyField(LicenseType, verbose_name='Licenser', through='License')

    def get_fullname(self):
        return f"{self.user.first_name} {self.user.last_name}"

    def set_fullname(self, value: str):
        parts = value.split(' ', 1)
        self.user.first_name = parts[0]
        if len(parts) > 1:
            self.user.last_name = parts[1]
        self.user.save()

    get_fullname.short_description = 'Namn'
    fullname = property(get_fullname, set_fullname)

    def get_email(self):
        return self.user.email

    def set_email(self, value):
        self.user.username = self.user.email = value
        self.user.save()

    email = property(get_email, set_email)

    def __str__(self):
        return f"{self.fullname} ({self.email})"

    @property
    def year_activities(self):
        '''returns completed/booked activities for this year'''
        current_year = datetime.date.today().year
        return Activity.objects \
            .filter(Q(assigned=self) | Q(assigned_for_proxy=self)) \
            .filter(event__start_date__year=current_year)

    @property
    def completed_weight(self):
        return self.year_activities \
            .filter(completed=True) \
            .aggregate(Sum('weight')) \
            .get('weight__sum', 0) or 0

    @property
    def booked_weight(self):
        booked_weight = self.year_activities \
            .exclude((~Q(delist_requests__member=None)) & Q(delist_requests__approved=None)) \
            .aggregate(booked_weight=Sum('weight')) \
            .get('booked_weight', 0) or 0

        return booked_weight + self.min_signup_bias

    def task_summary(self):
        '''returns completed/booked activities for this year'''
        return f"{self.completed_weight}/{self.booked_weight}"

    task_summary.short_description = 'Utförda/Bokade'
    task_summary = property(task_summary)


@receiver(post_save, sender=User)
def user_saved(sender, instance, created, **kwargs):
    if created:
        instance.member = Member.objects.create(user=instance)
        instance.email = instance.username
        instance.save()
        instance.member.save()
    elif instance.username != instance.email or 'email' in kwargs:
        instance.username = instance.email
        try:
            instance.member.email_verified = False
            instance.member.save()
        except Exception as e:
            logger.warning(
                f"User #{instance.id} - {instance.first_name} {instance.last_name} - {instance.email}: {e}")
        instance.save()


@receiver(post_save, sender=Member)
def member_saved(sender, instance, created, **kwargs):
    if created:
        events.new_user_created(instance)
        return

    if 'email' in kwargs:
        instance.user.username = instance.user.email = instance.email
        instance.email_verified = False
        instance.save()


class License(models.Model):
    class Meta:
        verbose_name = 'Licens'
        verbose_name_plural = 'Licenser'

    type = models.ForeignKey(LicenseType, verbose_name='Licenstyp', on_delete=models.CASCADE)
    member = models.ForeignKey(Member, verbose_name='Innehavare', on_delete=models.CASCADE)
    level  = models.CharField(max_length=1, verbose_name='Nivå')


class CarClass(models.Model):
    class Meta:
        verbose_name = 'Klass'
        verbose_name_plural = 'Klasser'
        ordering =  ['name']

    name = models.CharField(max_length=64, unique=True)
    abbrev = models.CharField(max_length=6, unique=True)
    comment = models.TextField()
    min_age = models.PositiveSmallIntegerField(verbose_name='Minsta ålder')
    max_age = models.PositiveSmallIntegerField(verbose_name='Högsta ålder')
    min_weight = models.PositiveSmallIntegerField(verbose_name='Minsta vikt')

    def __str__(self):
        return self.name

class Driver(models.Model):
    class Meta:
        verbose_name = 'Förare'
        verbose_name_plural = 'Förare'
        ordering = ['member', 'name']
        unique_together = ['member', 'name', 'number']

    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    name = models.CharField(verbose_name='Namn', max_length=128)
    number = models.PositiveSmallIntegerField(verbose_name='Nummer')
    klass = models.ForeignKey(CarClass, on_delete=models.SET_NULL, null=True, blank=True)
    birthday = models.DateField(verbose_name='Födelsedatum')

    def __str__(self):
        return self.name

class Attachment(models.Model):
    class Meta:
        verbose_name = 'Bifogad fil'
        verbose_name_plural = 'Bifogade filer'

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

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Aktivitetstyp'
        verbose_name_plural = 'Aktivitetstyper'


class Event(models.Model):
    '''Groups a set of tasks'''

    class Meta:
        ordering = ['start_date', 'end_date', 'name']
        verbose_name = 'Aktivitet'
        verbose_name_plural = 'Aktiviteter'
        indexes = [
            models.Index(fields=('start_date', 'end_date')),
            models.Index(fields=('type',)),
            models.Index(fields=('cancelled',))
        ]
        
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
        if not hasattr(self, '_activities_count'):
            self._activities_count = self.activities.count()
        return self._activities_count

    activities_count.short_description = 'Uppgifter'
    activities_count = property(activities_count)

    @staticmethod
    def activities_available_count_query():
        today = datetime.date.today()
        return Q(assigned=None) & (Q(earliest_bookable_date__lte=today) | Q(earliest_bookable_date=None))

    def activities_available_count(self):
        if not hasattr(self, '_activities_available_count'):
            self._activities_available_count = self.activities.filter(self.activities_available_count_query()).count()
        return self._activities_available_count

    activities_available_count.short_description = 'Lediga uppgifter'
    activities_available_count = property(activities_available_count)

    def has_bookable_activities(self):
        if not hasattr(self, '_has_bookable_activities'):
            if self.end_date < datetime.date.today():
                self._has_bookable_activities = False
            else:
                self._has_bookable_activities = self.activities_available_count > 0
        return self._has_bookable_activities

    has_bookable_activities.boolean = True  
    has_bookable_activities = property(has_bookable_activities)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        try:
            del self._activities_count
            del self._activities_available_count
            del self._has_bookable_activities
        except:
            pass

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
    assigned_for_proxy = models.ForeignKey(
        Member, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_via_proxies', verbose_name='Tilldelad som underhuggare åt')
    assigned_at = models.DateTimeField(null=True, blank=True)

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    comment = models.TextField(blank=True)
    weight = models.IntegerField(default=1, verbose_name='Värde')

    confirmed = models.BooleanField(
        default=False, verbose_name='Bekräftad')
    completed = models.BooleanField(
        default=None, null=True, blank=True, verbose_name='Utförd')
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
    def active_delist_request(self):
        try:
            return self.delist_requests.get(approved=None)
        except ActivityDelistRequest.DoesNotExist:
            return None

    def can_member_enlist(self, member:Member):
        return not self.event.activities.filter(assigned=member).exists()

    class Meta:
        ordering = ['start_time', 'end_time', 'name']
        verbose_name = 'Uppgift'
        verbose_name_plural = 'Uppgifter'
        indexes = [
            models.Index(fields=['assigned']),
            models.Index(fields=['event']),
            models.Index(fields=['event', 'assigned']),
            models.Index(fields=['assigned_for_proxy']),
            models.Index(fields=['earliest_bookable_date'])
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
