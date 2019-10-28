from django.contrib import admin
from app import models

@admin.register(models.Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass

@admin.register(models.Event)
class EventAdmin(admin.ModelAdmin):
    pass

@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass

@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    pass

