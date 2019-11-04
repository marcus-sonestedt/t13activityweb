"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".
"""

import django
from django.test import TestCase

# TODO: Configure your database in settings.py and sync before running tests.

class ViewTest(TestCase):
    """Tests for the application views."""

    if django.VERSION[:2] >= (1, 7):
        # Django 1.7 requires an explicit setup() when running tests in PTVS
        @classmethod
        def setUpClass(cls):
            super(ViewTest, cls).setUpClass()
            django.setup()

    def test_home(self):
        """Tests the home page."""
        response = self.client.get('/frontend/')
        self.assertContains(response, '<!DOCTYPE html>', 1, 200)

    def test_manifest(self):
        """Tests the home page."""
        response = self.client.get('/frontend/manifest.json')
        self.assertContains(response, '"short_name":', 1, 200)

    def test_static(self):
        """Tests the static redirect page."""
        response = self.client.get('/frontend/static')
        self.assertContains(response, '/static', 1, 302)