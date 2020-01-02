from django.contrib import admin
from django.contrib.auth.models import User

from app import models

def unregister(model):
    def f2(f):
        admin.site.unregister(model)
        return f

    return f2


class MemberInline(admin.StackedInline):
    model = models.Member

@unregister(User)
@admin.register(User)
class UserWithMemberAdmin(admin.ModelAdmin):
    model = User
    inlines = [MemberInline]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)


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
    inlines = [ActivityInline, ]


@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    pass


@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(admin.ModelAdmin):
    pass


@admin.register(models.FAQ)
class FAQAdmin(admin.ModelAdmin):
    pass
