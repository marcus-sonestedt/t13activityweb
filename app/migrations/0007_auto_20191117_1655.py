# Generated by Django 2.2.6 on 2019-11-17 15:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_auto_20191103_1747'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='cancelled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='activity',
            name='date',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='cancelled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='eventtype',
            name='fee_reimbursed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='eventtype',
            name='food_included',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='eventtype',
            name='rental_kart',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='member',
            name='membercard_number',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='activity',
            name='end_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='activity',
            name='start_time',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
