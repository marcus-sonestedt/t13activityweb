from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from django.urls import reverse
from django.utils.html import escape, mark_safe
from django.db.models import Q

import nested_inline.admin as nested
import logging

from app import models

logger = logging.getLogger(__name__)

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

class NestedLicenseInline(nested.NestedTabularInline):
    model = models.License
    verbose_name_plural = 'Licenser'
    fk_name = 'member'
    fields = ['type', 'level']
    extra = 0


class NestedDriverInline(nested.NestedTabularInline):
    model = models.Driver
    verbose_name_plural = 'Förare/Kart'
    fk_name = 'member'
    fields = ['name', 'number', 'klass', 'birthday']
    extra = 0

class NestedMemberInline(nested.NestedStackedInline):
    inlines = [NestedActivityInline, NestedProxyActivityInline, NestedADRInline, NestedLicenseInline, NestedDriverInline]
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
    inlines = [NestedActivityInline, NestedADRInline, NestedLicenseInline, NestedDriverInline]
    readonly_fields = ['user']
    list_filter = ['phone_verified', 'email_verified']
    search_fields = ['user', 'phone_number', 'membercard_number']

    def user_link(self, obj: User):
        link = reverse("admin:auth_user_change", args=[obj.user_id])
        return mark_safe(f'<a href="{link}">{escape(obj.fullname + " (" + obj.user.__str__() + ")")}</a>')

    def get_search_results(self, request, queryset, search_term):
        queryset = self.model.objects.filter( \
            Q(user__first_name__icontains=search_term)
            | Q(user__last_name__icontains=search_term)
            | Q(user__email__icontains=search_term)
        )

        return queryset, True

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



@admin.register(models.LicenseType)
class LicenseTypeAdmin(admin.ModelAdmin):
    search_fields = ['name', 'abbrev']

@admin.register(models.CarClass)
class CarClassAdmin(admin.ModelAdmin):
    search_fields = ['name', 'abbrev']
    list_display = (
        'name',
        'abbrev',
        'min_age',
        'max_age',
        'min_weight'
    )

class EventTypeAttachmentInline(admin.TabularInline):
    model = models.EventType.attachments.through


@admin.register(models.EventType)
class EventTypeAdmin(admin.ModelAdmin):
    inlines = [EventTypeAttachmentInline]
    search_fields = ['name']
    filter_horizontal = ['attachments']


class EventAttachmentInline(admin.TabularInline):
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


class ActivityTypeAttachmentInline(admin.TabularInline):
    model = models.ActivityType.attachments.through
    extra = 0
    search_fields = ['name']


@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    inlines = [ActivityTypeAttachmentInline]
    search_fields = ['name']
    filter_horizontal = ['attachments']


class ActivityAttachmentInline(admin.TabularInline):
    model = models.Activity.attachments.through
    extra = 0
    search_fields = ['name']


@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    inlines = [ActivityAttachmentInline]
    list_filter = ['completed', 'cancelled', 'type', 'event']
    list_display = ('name', 'type', 'event',  'date',
                    'assigned',  'confirmed', 'completed', 'cancelled')
    search_fields = ['name']
    filter_horizontal = ['attachments']
    actions = ['clone_activity']

    def clone_activity(self, requst, queryset):
        for obj in queryset:
            logger.info(f'Cloning {obj} 19 times')

            obj.assigned = None
            obj.assigned_for_proxy = None
            obj.assigned_at = None
            obj.confirmed = False
            obj.completed = False
            obj.cancelled = False

            name = obj.name

            for i in range(2, 21):
                obj.pk = None
                obj.name = f'{name} {i}'
                obj.save() # autogenerates new id

    clone_activity.short_description="Skapa 19 kopior på samma aktivitet"

@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(admin.ModelAdmin):
    list_filter = ['approved']
    list_display = (
        'member',
        'activity',
        'approved',
        'approver'
    )
    search_fields = ['member', 'activity']


@admin.register(models.FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = (
        'question',
        'answer_short',
        'order'
    )
    search_fields = ['question', 'answer']


@admin.register(models.InfoText)
class InfoTextAdmin(admin.ModelAdmin):
    search_fields = ['key', 'content']
