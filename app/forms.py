"""
Definition of forms.
"""

import re

from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import (
    authenticate, get_user_model, password_validation,
)

from django.utils.translation import ugettext_lazy as _

from captcha.fields import ReCaptchaField
from captcha.widgets import ReCaptchaV2Checkbox, ReCaptchaV3

captcha_attrs = {
    'data-theme': 'dark',
}


class BootstrapAuthenticationForm(AuthenticationForm):
    """Authentication form which uses bootstrap CSS & ReCaptcha."""

    captcha = ReCaptchaField(widget=ReCaptchaV3(attrs=captcha_attrs), label='captcha')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field in (f for f in self.fields.values() if f.label != 'captcha'):
            field.widget.attrs.update({'class': 'form-control'})


class BootstrapUserCreationForm(UserCreationForm):
    """Signup form which uses bootstrap css, ReCaptcha and adds some Member fields"""

    captcha = ReCaptchaField(widget=ReCaptchaV3(attrs=captcha_attrs))

    first_name = forms.CharField(
        max_length=64,
        label="Förnamn",
        widget=forms.TextInput({
            'class': 'form-control',
            'placeholder': 'Förnamn'})
    )
    last_name = forms.CharField(
        max_length=64,
        label="Efternamn",
        widget=forms.TextInput({
            'class': 'form-control',
            'placeholder': 'Efternamn'})
    )

    phone_number = forms.CharField(
        max_length=15,
        label="Telefonnummer",
        widget=forms.TextInput({
            'class': 'form-control',
            'placeholder': 'Telefonnummer'},),
        required=False,
        help_text="Måste vara på format: +46123456789"
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field in (f for f in self.fields.values() if f.label != 'captcha'):
            field.widget.attrs.update({'class': 'form-control'})

    def _post_clean(self):
        super()._post_clean()

        if not self.cleaned_data.get('first_name'):
            self.add_error('first_name', "Ange förnamn!")

        if not self.cleaned_data.get('last_name'):
            self.add_error('last_name', "Ange efternamn!")

        phone_number = self.cleaned_data.get('phone_number')
        if phone_number and not re.match(r"\+[0-9]{10,15}", phone_number):
            self.add_error('last_name',
                           "Måste börja med landskod (+46) och sen bara innehålla siffror!")
