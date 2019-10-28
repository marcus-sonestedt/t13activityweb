"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Profile(models.Model):
    '''Extends user object'''
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    comment = models.TextField(blank=True)

    class Meta:
        order_with_respect_to = 'user'

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Attachment(models.Model):
    uploader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField()
    comment = models.TextField()

class Event(models.Model):
    '''Groups a set of activities'''
    name = models.CharField(max_length=40)
    start_date = models.DateField()
    end_date = models.DateField()
    comment = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    coordinators = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    files = models.ManyToManyField(Attachment)

    class Meta:
        ordering = ['start_date', 'end_date']

class ActivityType(models.Model):
    '''Predefined type of activity with some help text to explain it'''
    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True)
    files = models.ManyToManyField(Attachment)

class Activity(models.Model):
    '''A specific activity on a given day, can be assigned to a user'''
    name = models.CharField(max_length=40)
    type = models.ForeignKey(ActivityType, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    comment = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)
    assigned = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    completed = models.BooleanField()

    class Meta:
        ordering=['start_time', 'end_time']

