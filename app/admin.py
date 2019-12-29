from django.contrib import admin
from app import models

@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    pass

@admin.register(models.EventType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass

class ActivityInline(admin.TabularInline):
    model = models.Activity

@admin.register(models.Event)
class EventAdmin(admin.ModelAdmin):
    inlines = [
        ActivityInline,
    ]

@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass

@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    pass

@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(admin.ModelAdmin):
    pass
