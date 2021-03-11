# Generated by Django 3.1.4 on 2021-03-11 15:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='asset',
            name='type',
        ),
        migrations.DeleteModel(
            name='AuthEmails',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='ticket',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='user',
        ),
        migrations.RemoveField(
            model_name='data',
            name='asset',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='creator',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='target',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='ticket',
        ),
        migrations.DeleteModel(
            name='Part',
        ),
        migrations.RemoveField(
            model_name='prediction',
            name='asset',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='asset',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='assignee',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='issue',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='technician',
        ),
        migrations.RemoveField(
            model_name='ticket',
            name='user',
        ),
        migrations.DeleteModel(
            name='Asset',
        ),
        migrations.DeleteModel(
            name='AssetType',
        ),
        migrations.DeleteModel(
            name='Comment',
        ),
        migrations.DeleteModel(
            name='Data',
        ),
        migrations.DeleteModel(
            name='Issue',
        ),
        migrations.DeleteModel(
            name='Notification',
        ),
        migrations.DeleteModel(
            name='Prediction',
        ),
        migrations.DeleteModel(
            name='Technician',
        ),
        migrations.DeleteModel(
            name='Ticket',
        ),
    ]
