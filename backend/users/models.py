from django.contrib.auth.models import User
from django.db import models
from django.conf import settings

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    is_registered = models.BooleanField(null=False, default=False)
    group_granted = models.BooleanField(null=False, default=False)
    verification = models.CharField(max_length=50, null=True)
