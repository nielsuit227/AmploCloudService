from django.db import models
from django.conf import settings


class AssetType(models.Model):
    type = models.TextField(unique=True, default='Undefined')
    description = models.TextField(blank=True, null=True)
    new_price = models.BigIntegerField(blank=True, null=True)


class Part(models.Model):
    name = models.TextField(blank=True, null=True, unique=True)
    price = models.IntegerField(blank=True, null=True)
    vendor = models.TextField(blank=True, null=True)
    stock = models.IntegerField(blank=False, null=False, default=0)
    location = models.TextField(blank=False, null=False)


class Asset(models.Model):
    type = models.ForeignKey(AssetType, on_delete=models.CASCADE)
    serial = models.TextField(blank=True, null=True, unique=True)
    location = models.TextField(blank=True, null=True)
    version = models.TextField(blank=True, null=True)
    parts = models.TextField(blank=True, null=True)
    commission_date = models.DateTimeField(blank=True, null=True)


class Technician(models.Model):
    name = models.TextField(blank=True, null=True)
    company = models.TextField(blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)


class Prediction(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    date = models.DateTimeField(blank=True, null=True)
    transformer_winding = models.FloatField(blank=True, null=True)
    degraded_capacitor = models.FloatField(blank=True, null=True)
    anomalies = models.BigIntegerField(blank=True, null=True)


class Issue(models.Model):
    title = models.TextField(blank=False, null=False)
    description = models.TextField(blank=True, null=True)
    template = models.TextField(blank=True, null=True)


class Ticket(models.Model):
    title = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    date_failure = models.DateTimeField(blank=True, null=True)
    date_service = models.DateTimeField(blank=True, null=True)
    date_operational = models.DateTimeField(blank=True, null=True)
    last_post = models.DateTimeField(blank=True, null=True)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='user')
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, blank=True, null=True)
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE, blank=True, null=True)
    new_parts = models.TextField(blank=True, null=True)
    cost = models.BigIntegerField(blank=True, null=True)
    predicted = models.BooleanField(blank=True, null=True)


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField(blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)


class AuthEmails(models.Model):
    email = models.TextField(blank=False, null=False, unique=True)


class Notification(models.Model):
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, default=1)
    notification = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='target')
    date = models.DateTimeField(null=False)
    read = models.BooleanField(null=False, default=False)


class Data(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    ts = models.DateTimeField()
    