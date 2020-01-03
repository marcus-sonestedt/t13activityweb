from django.urls import path, re_path, include
from django.contrib.auth.views import LogoutView

import app.views as views

from app.api_core import url_patterns as core_urlpatterns
from app.api_adr import url_patterns as adr_urlpatterns
from app.api_sms_email import url_patterns as sms_urlpatterns

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('signup/', views.signup, name="signup"),
    path('logout/', LogoutView.as_view(next_page='/frontend/welcome'), name='logout'),
]

api_urlpatterns = core_urlpatterns + adr_urlpatterns + sms_urlpatterns
