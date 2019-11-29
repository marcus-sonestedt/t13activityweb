from django.urls import path, re_path, include
from django.contrib.auth.views import LogoutView

import app.views as views
import app.api as api

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('signup/', views.signup, name="signup"),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
]

api_urlpatterns = [
    path('login', api.obtain_auth_token),
    path('logout', api.ClearAuthToken.as_view()),
    path('isloggedin', api.IsLoggedIn.as_view()),
    path('myactivities', api.MyActivities.as_view()),
    path('events', api.EventList.as_view()),
    re_path('events/(?P<id>.+)', api.EventList.as_view()),
    path('upcomingevents', api.UpcomingEventList.as_view()),
    re_path('event_activities/(?P<event_id>.+)', api.EventActivities.as_view())
]