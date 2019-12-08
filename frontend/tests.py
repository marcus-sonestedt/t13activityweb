"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".
"""

import django
from django.test import TestCase

# TODO: Configure your database in settings.py and sync before running tests.

class FrontendViewTest(TestCase):
    """Tests for the application views."""

    if django.VERSION[:2] >= (1, 7):
        # Django 1.7 requires an explicit setup() when running tests in PTVS
        @classmethod
        def setUpClass(cls):
            super(FrontendViewTest, cls).setUpClass()
            django.setup()

    def test_home(self):
        """Tests the home page."""
        response = self.client.get('/frontend/', follow=True)
        self.assertContains(response,
            "content=\"Team13's aktivitietwebb\"", 1, 200)

    def test_manifest_via_redirect(self):
        """Tests getting the manifest via redirects."""
        response = self.client.get('/manifest.json', follow=True)
        self.assertContains(response, '"short_name":', 1, 200)

    def test_manifest_in_static(self):
        """Tests getting the manifest via redirects."""
        response = self.client.get('/static/manifest.json')
        self.assertContains(response, '"short_name":', 1, 200)

    def test_manifest_redirect(self):
        """Tests that the manifest is riderected."""
        response = self.client.get('/manifest.json')
        self.assertRedirects(response, '/static/manifest.json')


    def test_static(self):
        """Tests the static redirect for favicon.ico."""
        response = self.client.get('/frontend/robots.txt', follow=False)
        self.assertRedirects(response, '/static/robots.txt')