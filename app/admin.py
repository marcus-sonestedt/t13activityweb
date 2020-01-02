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

    def model_str(self, obj: User):
        link = reverse("admin:auth_user_change", args=[obj.user_id])
        return mark_safe(f'<a href="{link}">{escape(obj.user.__str__())}</a>')

    model_str.short_description = 'Användare'
    model_str.admin_order_field = 'user' # Make row sortable

    list_display = (
        'model_str',
    )    


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
