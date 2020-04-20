from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from django.urls import reverse
from django.utils.html import escape, mark_safe

import nested_inline.admin as nested

from app import models

import bulk_admin

def unregister(model):
    def f2(f):
        admin.site.unregister(model)
        return f

    return f2


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    model = models.Attachment


class ActivityInline(admin.TabularInline):
    model = models.Activity
    extra = 0


class NestedActivityInline(nested.NestedTabularInline):
    readonly_fields = ['name', 'event', 'type', 'weight', 'assigned_for_proxy', 'earliest_bookable_date']
    fields = ['name', 'event', 'type', 'weight',  
        'assigned_for_proxy', 'earliest_bookable_date', 'confirmed', 'completed']
    model = models.Activity
    verbose_name_plural = 'Uppgifter'
    fk_name = 'assigned'
    extra = 0

class NestedProxyActivityInline(nested.NestedTabularInline):
    readonly_fields = ['name', 'event', 'type', 'weight', 'earliest_bookable_date']
    fields = ['name', 'event', 'type', 'weight',  
        'assigned', 'earliest_bookable_date', 'confirmed', 'completed']
    model = models.Activity
    verbose_name_plural = 'Underhuggares uppgifter'
    fk_name = 'assigned_for_proxy'
    extra = 0


class NestedADRInline(nested.NestedTabularInline):
    model = models.ActivityDelistRequest
    verbose_name_plural = 'Avbokningsförfrågningar'
    fk_name = 'member'
    readonly_fields = ['activity', 'approved', 'approver']
    fields = ['activity', 'reason', 'approved', 'approver',  'reject_reason']
    extra = 0


class NestedMemberInline(nested.NestedStackedInline):
    inlines = [NestedActivityInline, NestedProxyActivityInline, NestedADRInline]
    model = models.Member
    can_delete = False
    verbose_name_plural = 'Medlem'
    fk_name = 'user'
    readonly_fields = ['user']
    exclude = ['created', 'updated', 'email_verification_code',
               'email_verification_code_created', 'proxy']


@admin.register(User)
@unregister(User)
class UserWithMemberAdmin(nested.NestedModelAdmin):
    inlines = [NestedMemberInline]
    readonly_fields = ['username', 'last_login', 'date_joined']
    search_fields = ['username', 'first_name', 'last_name']
    exclude = ['user_permissions']

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)


@admin.register(models.Member)
class MemberAdmin(nested.NestedModelAdmin):
    inlines = [NestedActivityInline, NestedADRInline]
    readonly_fields = ['user']
    list_filter = ['phone_verified', 'email_verified']
    search_fields = ['user', 'phone_number', 'membercard_number']

    def user_link(self, obj: User):
        link = reverse("admin:auth_user_change", args=[obj.user_id])
        return mark_safe(f'<a href="{link}">{escape(obj.fullname + " (" + obj.user.__str__() + ")")}</a>')

    user_link.short_description = 'Användare'
    user_link.admin_order_field = 'user'  # Make row sortable

    list_display = (
        'user_link',
        'phone_number',
        'phone_verified',
        'email_verified',
        'task_summary',
        'membercard_number'
    )

    exclude = ['created', 'updated', 'email_verification_code',
               'email_verification_code_created']


class EventTypeAttachmentInline(bulk_admin.TabularBulkInlineModelAdmin):
    model = models.EventType.attachments.through


@admin.register(models.EventType)
class EventTypeAdmin(admin.ModelAdmin):
    inlines = [EventTypeAttachmentInline]
    search_fields = ['name']
    filter_horizontal = ['attachments']


class EventAttachmentInline(bulk_admin.TabularBulkInlineModelAdmin):
    model = models.Event.attachments.through
    extra = 0


class CoordinatorFilter(admin.SimpleListFilter):
    title = 'Koordinator'
    parameter_name = 'coordinator'

    def lookups(self, request, model_admin):
        staff = models.Member.objects.filter(user__is_staff=True)
        staff = [(m.id, m.fullname) for m in staff]
        staff.append((0, 'Ingen'))
        return staff

    def queryset(self, request, queryset):
        if self.value() is None:
            return queryset
        elif self.value() == '0':
            return queryset.filter(coordinators=None)
        else:
            return queryset.filter(coordinators=self.value())


@admin.register(models.Event)
class EventAdmin(admin.ModelAdmin):
    exclude = ['attachments']
    inlines = [ActivityInline, EventAttachmentInline]
    list_filter = ['type', 'cancelled', CoordinatorFilter]
    list_display = ['name', 'type', 'cancelled', 'start_date',
                    'activities_available_count', 'activities_count', ]
    search_fields = ['name']
    filter_horizontal = ['attachments', 'coordinators']


class ActivityTypeAttachmentInline(bulk_admin.TabularBulkInlineModelAdmin):
    model = models.ActivityType.attachments.through
    extra = 0
    search_fields = ['name']


@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    inlines = [ActivityTypeAttachmentInline]
    search_fields = ['name']
    filter_horizontal = ['attachments']


class ActivityAttachmentInline(bulk_admin.TabularBulkInlineModelAdmin):
    model = models.Activity.attachments.through
    extra = 0
    search_fields = ['name']


@admin.register(models.Activity)
class ActivityAdmin(bulk_admin.BulkModelAdmin):
    inlines = [ActivityAttachmentInline]
    list_filter = ['completed', 'cancelled', 'type', 'event']
    list_display = ('name', 'type', 'event',  'date',
                    'assigned',  'confirmed', 'completed', 'cancelled')
    search_fields = ['name']
    filter_horizontal = ['attachments']


@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(bulk_admin.BulkModelAdmin):
    list_filter = ['approved']
    list_display = (
        'member',
        'activity',
        'approved',
        'approver'
    )
    search_fields = ['member', 'activity']


@admin.register(models.FAQ)
class FAQAdmin(bulk_admin.BulkModelAdmin):
    list_display = (
        'question',
        'answer_short',
        'order'
    )
    search_fields = ['question', 'answer']


@admin.register(models.InfoText)
class InfoTextAdmin(abulk_admin.BulkModelAdmin):
    search_fields = ['key', 'content']
