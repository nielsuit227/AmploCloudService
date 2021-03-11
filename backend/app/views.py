from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
import numpy as np
from datetime import timedelta, datetime
import string, json, time, io, csv
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

# File Storage
# req_file = request.FILES['file']
# fs = FileSystemStorage()
# file = fs.save(req_file.name, req_file)
# return Response(fs.url(file))


def splitTime(timedelta):
    if timedelta is None:
        return '-'
    else:
        if timedelta.days >= 5:
            return str(timedelta.days) + 'd ' + str(int(timedelta.seconds / 60) // 60) + 'h'
        elif timedelta.days != 5:
            return str(timedelta.days) + 'd ' + str(int(timedelta.seconds / 60) // 60) + 'h ' + str(int(timedelta.seconds / 60) % 60) + 'm'
        else: 
            return str(int(timedelta.seconds / 60) // 60) + 'h ' + str(int(timedelta.seconds / 60) % 60) + 'm'


# Assets
############################################################