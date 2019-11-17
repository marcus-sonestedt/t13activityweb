from django.urls import path, re_path
from django.views.generic.base import RedirectView

from frontend import views

urlpatterns = [
    re_path(r'static/(.+)$', views.static, name='static'),
    re_path(r'^(.*)$', views.index, name='react'),
    re_path(r'^manifest.json$', RedirectView.as_view(url='/static/manifest.json'))
]
