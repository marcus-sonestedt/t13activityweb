"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import mail_managers

import datetime

# Create your models here.

class Member(models.Model):
    '''club member, Extends user object'''
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    fullname = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    comment = models.TextField(blank=True)
    licensed_driver = models.BooleanField(default=False)

    membercard_number = models.CharField(max_length=20, blank=True)

    class Meta:
        order_with_respect_to = 'user'
        verbose_name = 'Medlem'
        verbose_name_plural = 'Medlemmar'

    def __str__(self):
        if self.user:
            self.fullname = self.user.first_name + " " + self.user.last_name
        return f"{self.fullname or 'Member'} ({self.user.email})"

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()

        if self.user:
            self.fullname = self.user.first_name + " " + self.user.last_name
            self.email = self.user.email

        super(Member, self).save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        instance.member = Member.objects.create(user=instance)
        instance.email = instance.username
        instance.save()
    elif instance.username != instance.email:
        instance.username = instance.email
        instance.save()

    instance.member.save()

@receiver(post_save, sender=Member)
def email_managers_for_new_users(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        member = instance

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

class Attachment(models.Model):
    uploader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
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
    type = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True, blank=True)
    coordinators = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    attachments = models.ManyToManyField(Attachment, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    cancelled = models.BooleanField(default=False)

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
    name = models.CharField(max_length=40)
    type = models.ForeignKey(ActivityType, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

    assigned = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)

    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)

    comment = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)

    completed = models.BooleanField(default=False)
    cancelled = models.BooleanField(default=False)

    class Meta:
        ordering=['start_time', 'end_time', 'name']
        verbose_name = 'Uppgift'
        verbose_name_plural = 'Uppgifter'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if 'assigned' in kwargs:
            self.assigned_at = datetime.date.today()

        super(Activity, self).save(*args, **kwargs)


class ActivityDelistRequest(models.Model):
    '''request from a user to delist from an activity'''

    member = models.ForeignKey(Member, on_delete=models.CASCADE, \
        related_name='delist_request_members')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, \
        related_name='delist_requests')
    reason = models.TextField(blank=True)
    approved = models.BooleanField(default=None, null=True, blank=True)
    approver = models.ForeignKey(Member, on_delete=models.SET_NULL, \
        blank=True, null=True, related_name='approvers')
    reject_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.member}: {self.activity.name} ({self.activity.event.start_date})"

    class Meta:
        ordering = ['activity__assigned', 'activity__date']
        verbose_name = "Avbokningsbegäran"
        verbose_name_plural = "Avbokningsbegäranden"