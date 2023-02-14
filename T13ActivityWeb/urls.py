"""
Definition of urls for T13ActivityWeb.
"""

from datetime import datetime
from django.urls import path, re_path, include
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.views.generic.base import RedirectView

from app import urls as app_urls
from t13reg import urls as reg_urls
from frontend.urls import urlpatterns as frontend_urls
from T13ActivityWeb import settings

urlpatterns = [
    re_path(r'^$', RedirectView.as_view(url='static/index.html')),
    re_path(r'^frontend/(.*)', include(frontend_urls)),

    re_path(r'^(?P<path>[~/]+)$',
            RedirectView.as_view(url='static/%(path)s')),
    path('manifest.json',
         RedirectView.as_view(url='static/manifest.json')),

    path('app/', include(app_urls.urlpatterns)),
    path('api/', include(app_urls.api_urlpatterns)),

    path('reg/app/', include(reg_urls.urlpatterns)),
    path('reg/api/', include(reg_urls.api_urlpatterns)),

    path('admin/', admin.site.urls),
] \
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls))
    ] + urlpatterns

    print(f"URLPatterns: {urlpatterns}")
