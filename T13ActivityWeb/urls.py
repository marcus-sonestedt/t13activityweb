"""
Definition of urls for T13ActivityWeb.
"""

from datetime import datetime
from django.urls import path, re_path, include
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic.base import RedirectView
from app import forms, views, api
from frontend.urls import urlpatterns as frontend_urls

urlpatterns = [
    re_path(r'^$', RedirectView.as_view(url='frontend/'), name="redirect_to_frontend"),
    re_path(r'^frontend/(.*)', include(frontend_urls), name="frontend"),
    path('app/', views.home, name='home'),
    path('app/contact/', views.contact, name='contact'),
    path('app/about/', views.about, name='about'),
    path('app/login/',
         LoginView.as_view
         (
             template_name='login.html',
             authentication_form=forms.BootstrapAuthenticationForm,
             extra_context=
             {
                 'title': 'Log in',
                 'year' : datetime.now().year,
             }
         ),
         name='login'),
    path('app/signup/', views.signup, name="signup"),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('admin/', admin.site.urls),
    path('api/login', api.obtain_auth_token),
    path('api/logout', api.ClearAuthToken.as_view()),
    path('api/myactivities', api.MyActivities.as_view()),
    path('api/events', api.EventList.as_view()),
    path('api/upcomingevents', api.UpcomingEventList.as_view())
]
