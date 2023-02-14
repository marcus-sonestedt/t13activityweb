from django.shortcuts import render

# Create your views here.
"""
Definition of views.
"""

import datetime
import logging

from django.urls import path, re_path, include

from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth import login, authenticate
from django.contrib.auth import views as auth_views
from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_http_methods

from app import forms

logger = logging.getLogger(__name__)


def home(request):
    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    return redirect('/reg_frontend/home' if request.user.is_authenticated else '/reg_frontend/welcome')


def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'contact.html',
        {
            'title': 'Kontakt',
            'message': '''info@team13.se''',
            'year': datetime.date.today().year
        }
    )


def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'about.html',
        {
            'title': 'About',
            'message': 'En weppapplikation som hjälper Team 13 att registrera förare vid träningar.',
            'year': datetime.date.today().year
        }
    )


def signup(request):
    if request.method == 'POST':
        form = forms.MyUserCreationForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')

            user = form.save()
            user.refresh_from_db()
            user.member.phone_number = form.cleaned_data.get('phone_number')
            user.first_name = form.cleaned_data.get('first_name')
            user.last_name = form.cleaned_data.get('last_name')
            user.email = username
            user.save()

            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = forms.MyUserCreationForm()

    return render(request, 'signup.html', {
        'form': form,
        'year': datetime.date.today().year
    })


class MyLoginView(auth_views.LoginView):
    template_name = 'login.html'
    authentication_form = forms.MyAuthenticationForm
    extra_context = {
        'title': 'Logga in',
        'year': datetime.date.today().year
    }
    redirect_authenticated_user = True


class MyPasswordResetView(auth_views.PasswordResetView):
    '''ask for password reset by email'''
    form_class = forms.MyResetPasswordForm
    extra_content = {'year': datetime.date.today().year}


class MyPasswordResetDoneView(auth_views.PasswordResetDoneView):
    '''reset email sent'''
    extra_content = {'year': datetime.date.today().year}


class MyPasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    '''user inputs new password'''
    form_class = forms.MySetPasswordForm
    extra_content = {'year': datetime.date.today().year}


class MyPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    '''password has been reset'''
    extra_content = {'year': datetime.date.today().year}


class MyPasswordChangeView(auth_views.PasswordChangeView):
    '''change password when logged in'''
    form_class = forms.MyPasswordChangeForm
    extra_content = {'year': datetime.date.today().year}


class MyPasswordChangeDoneView(auth_views.PasswordChangeDoneView):
    '''confirm password change'''
    extra_content = {'year': datetime.date.today().year}


url_patterns = [
    path('', home, name='home'),
    path('contact/', contact, name='contact'),
    path('about/', about, name='about'),

    path('signup/', signup, name="signup"),
    path('login/', MyLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/frontend/welcome'), name='logout'),

    re_path(r'password_reset/$', MyPasswordResetView.as_view(),
            name="password_reset"),
    path('password_reset/done/', MyPasswordResetDoneView.as_view(),
         name="password_reset_done"),

    re_path(r'password_reset/confirm/(?P<uidb64>\w+)/(?P<token>[^/]+)$',
            MyPasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path('password_reset/complete/', MyPasswordResetCompleteView.as_view(),
         name="password_reset_complete"),

    re_path(r'change_password/$', MyPasswordChangeView.as_view(),
            name="password_change"),
    path('change_password/done/', MyPasswordChangeDoneView.as_view(),
         name="password_change_done"),
]
