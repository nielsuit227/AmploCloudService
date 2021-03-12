from django.contrib.auth.models import User, Group
from django.core.mail import send_mail
from rest_auth.views import LoginView, LogoutView, PasswordChangeView, APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import ensure_csrf_cookie
import logging, random, string
from users.models import Profile

# Create your views here.
class APILogoutView(LogoutView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

class CustomLoginView(LoginView):
    def get_response(self):
        try:
            original = super().get_response()
            user = Token.objects.get(key=original.data['key']).user
            profile = Profile.objects.filter(user=user)[0]
            # Check for Registration
            if not profile.is_registered:
                return Response('User not registered yet.', status=401)
            # Append data
            data = {
                'key': original.data['key'],
                'is_super': user.is_superuser,
                'groups': list(user.groups.values_list('name', flat=True)),
                'name': user.get_full_name(),
                }
            return Response(data)
        except Exception as e:
            # logging.exception(e)
            return Response(e)

class APIPasswordUpdateView(PasswordChangeView):
    authentication_classes = [SessionAuthentication]

class APICreateUser(APIView):
    def post(self, request, format=None):
        try:
            # Verification Key
            key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=50))
            # Add object
            user = User.objects.create_user(
                username=request.data['email'],
                email=request.data['email'],
                password=request.data['pass'],
                first_name=request.data['fname'],
                last_name=request.data['lname'],
                is_superuser=False,
            )
            profile = Profile(
                user=user,
                phone=request.data['phone'],
                is_registered=False,
                verification=key,
            )
            # Send Verification Mail
            activation_link = 'https://127.0.0.1:3000/auth/verify?email=%s&key=%s' % (request.data['email'], key)
            send_mail('Email Verification Amplo Quality Management Platform',
            "Hi %s!\n\nThanks for signing up to the Amplo Quality Management Platform. \nWe're very happy to see you here. Please verify your email so we can get started.\n\n%s\n\nPlease schedule a meeting soon on https://calendly.com/amplogmbh/consultation.\n\nBest regards,\n\nThe Amplo Team" % (request.data['fname'], activation_link),
            'info@amplo.ch',
            [request.data['email']])
            # Add group
            ind1 = request.data['email'].find('@') + 1
            ind2 = request.data['email'].find('.', ind1)
            group_name = request.data['email'][ind1: ind2].lower()
            groups = Group.objects.filter(name=group_name)
            if len(groups) == 0:
                group = Group(name=group_name)
                group.save()
                profile.group_granted = True
                user.is_staff = True
            user.groups.add(name=group_name)
            user.save()
            profile.save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add user: %s' % e)

class GrantGroupAccess(APIView):
    authentication_classes = [SessionAuthentication]
    def post(self, request, format=None):
        try:
            user = User.objects.filter(username=request.data['user'])[0]
            profile = Profile.objects.filter(user=user)[0]
            profile.group_granted = True
            profile.save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add user to your team: %s' % e)


class VerifyUser(APIView):
    def post(self, request, format=None):
        try:
            user = User.objects.filter(username=request.data['email'])[0]
            profile = Profile.objects.filter(user=user)[0]
            if profile.verification == request.data['key']:
                profile.verification = None
                profile.is_registered = True
                profile.save()
                return Response('Success')
            else:
                return Response('Failed', status=401)
        except Exception as e:
            return Response('Failed to Verify. ', e)

