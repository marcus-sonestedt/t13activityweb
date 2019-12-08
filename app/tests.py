"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".
"""

import django
from django.test import TestCase

# TODO: Configure your database in settings.py and sync before running tests.

class AppViewTest(TestCase):
    """Tests for the application views."""

    if django.VERSION[:2] >= (1, 7):
        # Django 1.7 requires an explicit setup() when running tests in PTVS
        @classmethod
        def setUpClass(cls):
            super(AppViewTest, cls).setUpClass()
            django.setup()
            django.conf.settings.DEBUG = True

    def test_home(self):
        """Tests the home page redirects."""
        response = self.client.get('/app/', follow=True)
        self.assertRedirects(response, 'static/index.html')

    def test_admin(self):
        """Tests the admin page."""
        response = self.client.get('/admin/', follow=True)
        #print(response.content)
        self.assertContains(response, 'Django webbplatsadministration', 1, 200)

