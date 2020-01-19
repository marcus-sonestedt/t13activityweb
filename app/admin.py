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


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    model = models.Attachment


class ActivityInline(admin.TabularInline):
    model = models.Activity
    extra = 0


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


class MemberActivityInline(admin.TabularInline):
    model = models.Activity
    verbose_name_plural = 'Aktiviteter'
    fk_name = 'assigned'
    extra = 0
    exclude = ['assigned_at', 'attachments', 'comment']


class MemberADRInline(admin.TabularInline):
    model = models.ActivityDelistRequest
    verbose_name_plural = 'Avboknigsförfrågningar'
    fk_name = 'member'
    readonly_fields = ['member', 'activity']
    extra = 0


@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    inlines = [MemberActivityInline, MemberADRInline]
    readonly_fields = ['user']
    list_filter = ['phone_verified', 'email_verified']

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


class EventTypeAttachmentInline(admin.TabularInline):
    model = models.EventType.attachments.through


@admin.register(models.EventType)
class EventTypeAdmin(admin.ModelAdmin):
    exclude = ['attachments']
    inlines = [EventTypeAttachmentInline]


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


class ActivityTypeAttachmentInline(admin.TabularInline):
    model = models.ActivityType.attachments.through
    extra = 0


@admin.register(models.ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    exclude = ['attachments']
    inlines = [ActivityTypeAttachmentInline]


class ActivityAttachmentInline(admin.TabularInline):
    model = models.Activity.attachments.through
    extra = 0


@admin.register(models.Activity)
class ActivityAdmin(admin.ModelAdmin):
    exclude = ['attachments']
    inlines = [ActivityAttachmentInline]
    list_filter = ['completed', 'cancelled', 'type', 'event']
    list_display = ('name', 'type', 'event',  'date',
                    'assigned',  'confirmed', 'completed', 'cancelled')


@admin.register(models.ActivityDelistRequest)
class ActivityDelistRequestAdmin(admin.ModelAdmin):
    list_filter = ['approved']
    list_display = (
        'member',
        'activity',
        'approved',
        'approver'
    )


@admin.register(models.FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = (
        'question',
        'answer_short',
        'order'
    )


@admin.register(models.InfoText)
class InfoTextAdmin(admin.ModelAdmin):
    pass
