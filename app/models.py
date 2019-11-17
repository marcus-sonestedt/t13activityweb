"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

# Create your models here.

class Member(models.Model):
    '''club member, Extends user object'''
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    fullname = models.CharField(max_length=120, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    comment = models.TextField(blank=True)
    licensed_driver = models.BooleanField(default=False)

    membercard_number = models.CharField(max_length=20, blank=True)

    class Meta:
        order_with_respect_to = 'user'

    def __str__(self):
        if self.user:
            self.fullname = self.user.first_name + " " + self.user.last_name
        return self.fullname or "Member {}".format(self.id)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()

        if self.user:
            self.fullname = self.user.first_name + " " + self.user.last_name

        super(Member, self).save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Member.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.member.save()

class Attachment(models.Model):
    uploader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField()
    comment = models.TextField()
    created = models.DateTimeField()
    modified = models.DateTimeField()

    def __str__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(User, self).save(*args, **kwargs)


class EventType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)

    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    files = models.ManyToManyField(Attachment)

    fee_reimbursed = models.BooleanField(default=False)
    food_included = models.BooleanField(default=False)
    rental_kart = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Event(models.Model):
    '''Groups a set of activities'''
    name = models.CharField(max_length=40)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    comment = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    coordinators = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    files = models.ManyToManyField(Attachment)
    type = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    cancelled = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['start_date', 'end_date', 'name']

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(User, self).save(*args, **kwargs)

class ActivityType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    files = models.ManyToManyField(Attachment)

    def __str__(self):
        return self.name

class Activity(models.Model):
    '''A specific activity on a given day, can be assigned to a user'''
    name = models.CharField(max_length=40)
    type = models.ForeignKey(ActivityType, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField(null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    comment = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)
    assigned = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)

    completed = models.BooleanField(default=False)
    cancelled = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering=['start_time', 'end_time', 'name']

