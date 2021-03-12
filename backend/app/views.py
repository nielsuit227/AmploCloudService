from django.conf import settings
from django.contrib.auth.models import User, Group
from django.core.files.storage import FileSystemStorage
import numpy as np
from datetime import timedelta, datetime
import string, json, time, io, csv, os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from app.models import DiagnosticsModels, DiagnosticDataFiles, DiagnosticEntries, \
PredictiveModels, PredictiveDataFiles, PredictiveEntries

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


# Models
############################################################\
# class apiTemplate(APIView):
#     authentication_classes = [SessionAuthentication]
#     permission_classes = [IsAuthenticated]
#     def post(self, request, format=None):
#         try:
#             return Response()
#         except Exception as e:
#             return Response('Failed to %s' % e)
class getModels(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            try:
                group = Group.objects.filter(name=request.data['group'])[0]
            except:
                return Response("You're team manager has not yet granted you access.")
            if 'type' in request.data.keys():
                if request.data['type'] == 'ad':
                    return Response(list(DiagnosticsModels.objects.filter(group=group).values()))
                elif request.data['type'] == 'pm':
                    return Response(list(PredictiveModels.objects.filter(group=group).values()))
            else:
                return Response({
                    'ad': list(DiagnosticsModels.objects.filter(group=group).values()),
                    'pm': list(PredictiveModels.objects.filter(group=group).values()),
                })
        except Exception as e:
            return Response('Failed to %s' % e)

class changeModel(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Get group
            try:
                group = Group.objects.filter(name=request.data['group'])[0]
            except:
                return Response("You're team manager has not yet granted you access.")
            # Automated Diagnostics
            if request.data['type'] == 'ad':
                typeObject = DiagnosticsModels
            elif request.data['type'] == 'pm':
                typeObject = PredictiveModels
            # Get model instance
            model = typeObject.objects \
                .filter(group=group, title=request.data['title'])
            if len(model) == 0:
                model = typeObject()
            else:
                model = model[0]
            # Update model
            for key in request.data.keys():
                if key == 'group':
                    model.group = group
                else:
                    setattr(model, key, request.data[key])
            # Save
            model.save()
            # Create directory
            typeFolder = os.path.join(settings.STATIC_ROOT, request.data['type'])
            os.mkdir(os.path.join(typeFolder, request.data['folder']))
            return Response('Success!')
        except Exception as e:
            return Response('Failed to %s' % e)

# Folders
class getFolders(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Get group
            try:
                group = Group.objects.filter(name=request.data['group'])[0]
            except:
                return Response("You're team manager has not yet granted you access.")
            # Automated Diagnostics
            if request.data['type'] == 'ad':
                typeObject = DiagnosticDataFiles
            elif request.data['type'] == 'pm':
                typeObject = PredictiveDataFiles
            # Query
            objects = typeObjects.objects.filter(group=group) \
                .annotate(faulty=Count(Case(When(faulty=True, then=1)))) \
                .annotate(healthy=Count(Case(When(faulty=False, then=1))))
            return Response(typeObject.objects.filter(group=group))
        except Exception as e:
            return Response('Failed to %s' % e)

