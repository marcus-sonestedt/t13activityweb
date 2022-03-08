from calendar import c
from django.db import models
from django.core.exceptions import ValidationError

from app import models as appModels

# Create your models here.

class ExternalDriver(models.Model, appModels.DriverFields):
    class Meta:
        order_with_respect_to = 'user'
        verbose_name = 'Besökare'
        verbose_name_plural = 'Besökare'
        indexes = [
            models.Index(fields=['user']),
        ]    

    user = models.OneToOneField(models.User, on_delete=models.CASCADE)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    lastvisit = models.DateField(auto_now=True)

    email_verified = models.BooleanField(default=False,
                                         verbose_name="Emailaddress verifierad")

    def get_email(self):
        return self.user.email

    def set_email(self, value):
        self.user.email = value
        self.user.username = value
        self.user.save()

    email = property(get_email, set_email)

    def __str__(self):
        return f"{self.fullname} ({self.email})"

    def get_fullname(self):
        return f"{self.user.first_name} {self.user.last_name}"

    def set_fullname(self, value: str):
        parts = value.split(' ', 1)
        self.user.first_name = parts[0]
        if len(parts) > 1:
            self.user.last_name = parts[1]
        self.user.save()

    fullname = property(get_fullname, set_fullname)
    fullname.short_description = 'Namn'

class RegDriver(models.Model):
    '''represents either club member or a visiting driver'''
    class Meta:
        verbose_name = 'Registrerad Förare'

    member_driver = models.ForeignKey(appModels.Driver, null=True, on_delete=models.CASCADE)
    ext_driver = models.ForeignKey(ExternalDriver, null=True, on_delete=models.CASCADE)
    
    @property
    def driver(self):
        return self.member_driver if self.member_driver is not None else self.ext_driver

    def clean(self):
        super().clean()
        if (self.member_driver is None) == (self.ext_driver is None):
            raise ValidationError("One and only one of the fields must be set")

    def __str__(self):
        return str(self.driver)

class Registration(models.Model):
    class Meta:
        verbose_name = "Registrering"
        verbose_name_plural = "Registreringar"
        ordering = ['date', 'driver']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['driver']),            
        ]

    date = models.DateField(auto_now_add=True)
    driver = models.ForeignKey(RegDriver)