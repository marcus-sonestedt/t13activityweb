from django.urls import path, re_path
from frontend import views

urlpatterns = [
    re_path(r'static/(.+)$', views.static, name='static'),
    re_path(r'^(.*)$', views.index, name='react')
]
