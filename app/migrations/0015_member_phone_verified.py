# Generated by Django 2.2.6 on 2019-12-27 20:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0014_auto_20191226_2027'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='phone_verified',
            field=models.BooleanField(default=False),
        ),
    ]