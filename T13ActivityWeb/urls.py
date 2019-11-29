"""
Definition of urls for T13ActivityWeb.
"""

from datetime import datetime
from django.urls import path, re_path, include
from django.contrib import admin
from django.views.generic.base import RedirectView
from app import urls as app_urls
from frontend.urls import urlpatterns as frontend_urls

urlpatterns = [
    re_path(r'^$', RedirectView.as_view(url='frontend/'), name="redirect_to_frontend"),
    re_path(r'^frontend/(.*)', include(frontend_urls), name="frontend"),
    path('app/', include(app_urls.urlpatterns)),
    path('api/', include(app_urls.api_urlpatterns)),
    path('admin/', admin.site.urls),
]
