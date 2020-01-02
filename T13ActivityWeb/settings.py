"""
Django settings for T13ActivityWeb project.

Based on 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os,sys
import os.path as path
import logging

from django.core.exceptions import ImproperlyConfigured
from django.contrib.staticfiles.finders import AppDirectoriesFinder


logger = logging.getLogger(__name__)

def get_env_value(env_variable):
    try:
        return os.environ[env_variable]
    except KeyError:
        error_msg = 'Set the {} environment variable'.format(env_variable)
        raise ImproperlyConfigured(error_msg)


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print(f"BASE_DIR: {BASE_DIR}")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

secret_names = [
    'DATABASES',

    'SECRET_KEY',
    'RECAPTCHA_PUBLIC_KEY',
    'RECAPTCHA_PRIVATE_KEY',

    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_VERIFY_SID',
    'SMS_FROM_NUMBER',

    'EMAIL_HOST',
    'EMAIL_HOST_USER',
    'EMAIL_HOST_PASSWORD',
    'EMAIL_PORT',
    'EMAIL_USE_TLS',

    'SENDGRID_API_KEY']

this_module = sys.modules[__name__]

for n in secret_names:
    setattr(this_module, n, None)

try:
    import T13ActivityWeb.secrets as secrets
except (AttributeError, ImportError) as e:
    print(f"WARNING: Failed to import T13ActivityWeb/secrets.py: {e}")
    secrets = None

SILENCED_SYSTEM_CHECKS = []    
EMAIL_HOST = None

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
print (f"DEBUG: {DEBUG}")

for n in secret_names:
    if hasattr(secrets, n):
        setting = getattr(secrets, n)
        setattr(this_module, n, setting)
        continue

    print(f"  {n} not found")

    if not n.startswith('EMAIL_'):
        setattr(this_module, n, '')

    if n == 'EMAIL_HOST':
        print("    Disabling email")
        del EMAIL_HOST

    if n.startswith('RECAPTCHA_'):
        SILENCED_SYSTEM_CHECKS += 'captcha.recaptcha_test_key_error'

    if n == 'SECRET_KEY':
        print('    WARNING: Using predefined SECRET_KEY, not ok in production!')
        SECRET_KEY = '97e6d0e8-dd64-42d0-bfae-bf2f3ea54fa4'

    if n == 'DATABASES':
        print("    INFO: Using local sqlite database")
        # Databases
        # https://docs.djangoproject.com/en/2.2/ref/settings/#databases
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
            }
        }

# will get emails with site errors
ADMINS = [
    ('Marcus Sonestedt', 'marcus.s.lindblom@gmail.com')
]

# will get content notifications (broken links, new users, etc)
MANAGERS = [
    ('Marcus Sonestedt', 'marcus.s.lindblom@gmail.com'),
]

SERVER_EMAIL = DEFAULT_FROM_EMAIL = 't13-noreply@macke.eu.pythonanywhere.com'

ALLOWED_HOSTS = [
    'macke.eu.pythonanywhere.com',
    'macke.pythonanywhere.com',
    'localhost'
]

# common urls
LOGIN_REDIRECT_URL = '/frontend/home/'
LOGIN_URL = '/app/login/'
LOGOUT_REDIRECT_URL = '/frontend/welcome'

# Application references
# https://docs.djangoproject.com/en/2.1/ref/settings/#std:setting-INSTALLED_APPS
INSTALLED_APPS = [
    'app.apps.ActivityListAppConfig',
    'frontend',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'captcha'
]

# Middleware framework
# https://docs.djangoproject.com/en/2.1/topics/http/middleware/
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    'app.middleware.disable_api_cache_middleware',
]

ROOT_URLCONF = 'T13ActivityWeb.urls'

# Template configuration
# https://docs.djangoproject.com/en/2.1/topics/templates/
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'T13ActivityWeb.wsgi.application'

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/
LANGUAGE_CODE = 'sv-se'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = path.join(BASE_DIR, 'static')

# in addition to <application>/static/
STATICFILES_DIRS = [
    path.join(BASE_DIR, 'frontend','build'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = path.join(BASE_DIR, 'media')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
         },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO'
    }
}

if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        }
    }

# recaptcha
RECAPTCHA_PROXY = {
    #    'http': 'http://localhost:8000',
    #    'https': 'https://localhost:8000'
}

# https://developers.google.com/recaptcha/docs/v3#score
RECAPTCHA_REQUIRED_SCORE = 0.5

# default is www.google.xom
#RECAPTCHA_DOMAIN = 'www.recaptcha.net'

REST_FRAMEWORK = {
    'DATETIME_FORMAT': "%Y-%m-%dT%H:%M:%SZ",
    'DEFAULT_PAGINATION_CLASS': 'app.drf_defaults.DefaultResultsSetPagination',
    'PAGE_SIZE': 10
}