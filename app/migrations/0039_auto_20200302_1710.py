# Generated by Django 2.2.10 on 2020-03-02 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0038_merge_20200201_1642'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='proxy',
            field=models.ManyToManyField(blank=True, related_name='proxies', to='app.Member', verbose_name='Huvudman'),
        ),
    ]