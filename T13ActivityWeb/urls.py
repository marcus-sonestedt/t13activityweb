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
from frontend.urls import urlpatterns as frontend_urls
from T13ActivityWeb import settings

import oauth2_provider.views as oauth2_views


# OAuth2 provider endpoints
oauth2_endpoint_views = [
    path('authorize/', oauth2_views.AuthorizationView.as_view(), name="authorize"),
    path('token/', oauth2_views.TokenView.as_view(), name="token"),
    path('revoke-token/', oauth2_views.RevokeTokenView.as_view(), name="revoke-token"),
]

if settings.DEBUG:
    # OAuth2 Application Management endpoints
    oauth2_endpoint_views += [
        path('applications/', oauth2_views.ApplicationList.as_view(), name="list"),
        path('applications/register/',
             oauth2_views.ApplicationRegistration.as_view(), name="register"),
        path('applications/<pk>/',
             oauth2_views.ApplicationDetail.as_view(), name="detail"),
        path('applications/<pk>/delete/',
             oauth2_views.ApplicationDelete.as_view(), name="delete"),
        path('applications/<pk>/update/',
             oauth2_views.ApplicationUpdate.as_view(), name="update"),
    ]

    # OAuth2 Token Management endpoints
    oauth2_endpoint_views += [
        path('authorized-tokens/', oauth2_views.AuthorizedTokensListView.as_view(),
             name="authorized-token-list"),
        path('authorized-tokens/<pk>/delete/', oauth2_views.AuthorizedTokenDeleteView.as_view(),
             name="authorized-token-delete"),
    ]

urlpatterns = [
    re_path(r'^$', RedirectView.as_view(url='static/index.html')),
    re_path(r'^frontend/(.*)', include(frontend_urls)),

    re_path(r'^(?P<path>[~/]+)$',
            RedirectView.as_view(url='static/%(path)s')),
    path('manifest.json',
         RedirectView.as_view(url='static/manifest.json')),

    path('app/', include(app_urls.urlpatterns)),
    path('api/', include(app_urls.api_urlpatterns)),
    path('admin/', admin.site.urls),

    # OAuth 2 endpoints:
    # need to pass in a tuple of the endpoints as well as the app's name
    # because the app_name attribute is not set in the included module
    path('o/', include((oauth2_endpoint_views, 'oauth2_provider'),
         namespace="oauth2_provider")),
] \
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls))
    ] + urlpatterns


# print(urlpatterns)
