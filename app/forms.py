"""
Definition of forms.
"""

from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils.translation import ugettext_lazy as _

from captcha.fields import ReCaptchaField
from captcha.widgets import ReCaptchaV2Checkbox, ReCaptchaV3

class BootstrapAuthenticationForm(AuthenticationForm):
    """Authentication form which uses boostrap CSS & ReCaptcha."""
    username = forms.CharField(max_length=64,
                               widget=forms.TextInput({
                                   'class': 'form-control',
                                   'placeholder': 'User name'}))
    password = forms.CharField(label=_("Password"),
                               widget=forms.PasswordInput({
                                   'class': 'form-control',
                                   'placeholder':'Password'}))
    captcha = ReCaptchaField(widget=ReCaptchaV3)

class BootstrapUserCreationForm(UserCreationForm):
    """Signup form which uses ReCaptcha"""
    captcha = ReCaptchaField(widget=ReCaptchaV2Checkbox)
