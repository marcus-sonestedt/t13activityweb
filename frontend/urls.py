from django.urls import path, re_path
from django.views.generic.base import RedirectView

from frontend import views

urlpatterns = [
    re_path(r'^static/(?P<path>.+)$', RedirectView.as_view(url='static/%(path)s')),
    re_path(r'^(.*)$', views.index, name='react'),
]
