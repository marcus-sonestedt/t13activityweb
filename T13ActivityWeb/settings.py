"""
Django settings for T13ActivityWeb project.

Based on 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
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

try:
    import T13ActivityWeb.secrets as secrets

    SECRET_KEY = secrets.DJANGO_SECRET_KEY
    RECAPTCHA_PUBLIC_KEY = secrets.RECAPTCHA_PUBLIC_KEY
    RECAPTCHA_PRIVATE_KEY = secrets.RECAPTCHA_PRIVATE_KEY

    EMAIL_HOST = secrets.EMAIL_HOST
    EMAIL_HOST_USER = secrets.EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = secrets.EMAIL_HOST_PASSWORD
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True

    print("Secrets imported successfully")

except (AttributeError, ImportError) as e:
    print(
        f"WARNING: Failed to import secrets: {e}. Disabling captcha and email!")
    SILENCED_SYSTEM_CHECKS = ['captcha.recaptcha_test_key_error']

    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY = os.environ.get(
        'DJANGO_SECRET_KEY', '97e6d0e8-dd64-42d0-bfae-bf2f3ea54fa4')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
print (f"DEBUG: {DEBUG}")

# will get site errors
ADMINS = [
    ('Marcus Sonestedt', 'marcus.s.lindblom@gmail.com')
]

# will get content notifications (broken links, new users, etc)
MANAGERS = [
    ('Marcus Sonestedt', 'marcus.s.lindblom@gmail.com'),
]

DEFAULT_FROM_EMAIL = 'noreply@macke.eu.pythonanywhere.com'

ALLOWED_HOSTS = [
    'macke.eu.pythonanywhere.com',
    'macke.pythonanywhere.com',
    'localhost'
]

# Application references
# https://docs.djangoproject.com/en/2.1/ref/settings/#std:setting-INSTALLED_APPS
INSTALLED_APPS = [
    'app',
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

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

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
USE_TZ = True

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
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}