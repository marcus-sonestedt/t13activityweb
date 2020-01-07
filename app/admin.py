from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from django.urls import reverse
from django.utils.html import escape, mark_safe

from app import models

def unregister(model):
    def f2(f):
        admin.site.unregister(model)
        return f

    return f2


class ActivityInline(admin.TabularInline):
    model = models.Activity


class MemberInline(admin.StackedInline):
    model = models.Member
    can_delete = False
    verbose_name_plural = 'Medlem'
    fk_name = 'user'
    readonly_fields = ['user']
    
@admin.register(User)
@unregister(User)
class UserWithMemberAdmin(UserAdmin):
    inlines = [MemberInline]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)


@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    readonly_fields = ['user']
    list_filter=['phone_verified', 'email_verified']

    def user_link(self, obj: User):
        link = reverse("admin:auth_user_change", args=[obj.user_id])
        return mark_safe(f'<a href="{link}">{escape(obj.fullname + " (" + obj.user.__str__() + ")")}</a>')

    user_link.short_description = 'Användare'
    user_link.admin_order_field = 'user' # Make row sortable

    list_display = (
        'user_link',
        'phone_number',
        'phone_verified',
        'email_verified',
        'task_summary'
    )    


@admin.register(models.EventType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass




@admin.register(models.Event)
class EventAdmin(admin.ModelAdmin):
    inlines = [ActivityInline, ]
    list_filter=['type', 'cancelled']


@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_filter=['completed', 'cancelled', 'type']
    list_display = (
        'name',
        'type',
        'event',
        'date',
        'assigned',
        'completed',
        'cancelled'
    )
    

@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(admin.ModelAdmin):
    list_filter=['approved']
    list_display = (
        'member',
        'activity',
        'approved',
        'approver'
    )


@admin.register(models.FAQ)
class FAQAdmin(admin.ModelAdmin):
    pass

@admin.register(models.InfoText)
class FAQAdmin(admin.ModelAdmin):
    pass

