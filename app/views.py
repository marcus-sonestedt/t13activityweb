"""
Definition of views.
"""

from datetime import datetime
import logging
import app.excel

from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth import login, authenticate
from django.contrib.auth.views import LoginView
from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_http_methods

from app.forms import BootstrapUserCreationForm, BootstrapAuthenticationForm
from app.excel import importDataFromExcel

logger = logging.getLogger(__name__)


def home(request):
    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    return redirect('/frontend/home' if request.user.is_authenticated else '/frontend/welcome')

def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'contact.html',
        {
            'title': 'Contact',
            'message': '''For web site technical issues, contact marcus.s.lindblom@gmail.com\r\n\r\n
                For issues w.r.t. the club, events and tasks, contat info@team13.se.''',
            'year': datetime.now().year,
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
            'message': 'En weppapplikation som hjälper Team 13 att hantera aktivitetslistor och uppgifter åt sina medlemmar.',
            'year': datetime.now().year,
        }
    )


def signup(request):
    if request.method == 'POST':
        form = BootstrapUserCreationForm(request.POST)
#        if 'localhost' in request.get_host() and 'captcha' in form.fields:
#            del form.fields['captcha']

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
        form = BootstrapUserCreationForm()
        #if 'localhost' in request.get_host() and 'captcha' in form.fields:
        #    del form.fields['captcha']

    return render(request, 'signup.html', {
        'form': form,
        'year': datetime.now().year
    })


class MyLoginView(LoginView):
    template_name = 'login.html'
    authentication_form = BootstrapAuthenticationForm
    extra_context = {
        'title': 'Logga in',
        'year': datetime.now().year,
    }
    redirect_authenticated_user = True

#    def get_form(self, form_class=None):
#        form = super().get_form(form_class)
#        if 'localhost' in self.request.get_host() and 'captcha' in form.fields:
#            del form.fields['captcha']
#        return form

    def dispatch(self, request, *args, **kwargs):
        self._request = request
        return super().dispatch(request, *args, **kwargs)


@staff_member_required
@require_http_methods(['GET', 'POST'])
def excelImport(request):
    msgs = []

    if request.method == 'POST':
        for file in request.files:
            try:
                importDataFromExcel(file, request.user)
            except Exception as e:
                logger.warning(e)
                msgs.append(f'{file.name}: {e}')

    return render(
        request,
        'excelImport.html',
        {'year': datetime.date.today().year,
         'messages': msgs,
         'success': None
         }
    )
