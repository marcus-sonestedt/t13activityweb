from django.apps import AppConfig
from datetime import date

class ActivityListAppConfig(AppConfig):
    # generic config
    name = 'app'
    verbose_name = 'Activity List'

    # app specific settings, should probably be in a db config object
    # and show on start page
    MIN_ACTIVITY_SIGNUPS = 5
