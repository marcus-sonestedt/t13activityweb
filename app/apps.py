from django.apps import AppConfig
from datetime import date

class ActivityListAppConfig(AppConfig):
    # generic config
    name = 'app'
    verbose_name = 'Activity List'

    # app specific settings
    MIN_ACTIVITY_SIGNUPS = 5
    LATEST_BOOKABLE_DATE = date(2020, 7, 31)