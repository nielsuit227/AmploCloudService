from django.contrib.auth.models import Group
from django.db import models
from django.conf import settings


# class Notification(models.Model):
#     target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     notification = models.TextField(blank=True, null=True)
#     creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='target')
#     date = models.DateTimeField(null=False)
#     read = models.BooleanField(null=False, default=False)

class DiagnosticsModels(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    title = models.TextField(unique=True, null=False)
    folder = models.TextField(unique=True, null=False)
    version = models.TextField(unique=False, null=False)

class PredictiveModels(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    title = models.TextField(unique=True, null=False)
    folder = models.TextField(unique=True, null=False)
    version = models.TextField(unique=False, null=False)

class DiagnosticDataFiles(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    model = models.ForeignKey(DiagnosticsModels, on_delete=models.CASCADE)
    filename = models.TextField(unique=True, null=False)
    folder = models.TextField(unique=False, null=False)
    faulty = models.BooleanField(null=False)

class PredictiveDataFiles(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    model = models.ForeignKey(PredictiveModels, on_delete=models.CASCADE)
    filename = models.TextField(unique=True, null=False)
    folder = models.TextField(unique=False, null=False)
    faulty = models.BooleanField(null=False)

class DiagnosticEntries(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    model = models.ForeignKey(DiagnosticsModels, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_created=True)
    serial = models.TextField(null=False)
    failure_probability = models.IntegerField(null=False)
    correct = models.TextField(null=True)

class PredictiveEntries(models.Model):
    group = models.ForeignKey(Group, on_delete=models.PROTECT)
    model = models.ForeignKey(PredictiveModels, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_created=True)
    serial = models.TextField(null=False)
    failure_probability = models.IntegerField(null=False)
    remaining_lifetime = models.IntegerField(null=True)
    correct = models.TextField(null=True)
