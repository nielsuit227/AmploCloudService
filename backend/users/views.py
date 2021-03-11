from django.contrib.auth.models import User, Group
from rest_auth.views import LoginView, LogoutView, PasswordChangeView, APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import ensure_csrf_cookie
from users.models import Phone 
import logging

# Create your views here.
class APILogoutView(LogoutView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class CustomLoginView(LoginView):
    def get_response(self):
        try:
            original = super().get_response()
            user = Token.objects.get(key=original.data['key']).user
            data = {
                'key': original.data['key'],
                'is_super': user.is_superuser,
                'groups': list(user.groups.values_list('name', flat=True)),
                'name': user.get_full_name(),
                }
            return Response(data)
        except Exception as e:
            logging.exception(e)
            return Response(e)

class APIPasswordUpdateView(PasswordChangeView):
    authentication_classes = [TokenAuthentication]

class APICreateUser(APIView):
    def post(self, request, format=None):
        try:
            # Username (check if not exist)
            username = request.data['fname'][0] + request.data['lname']
            usernames = User.objects.filter(username__startswith=username)
            if len(usernames) != 0:
                username += str(len(usernames))
            # Add object
            user = User.objects.create_user(
                username=username,
                email=request.data['email'],
                password=request.data['pass'],
                first_name=request.data['fname'],
                last_name=request.data['lname'],
                is_superuser=False,
            )
            user.save()
            Phone(
                user=user,
                phone=request.data['phone']
            ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add user: %s' % e)
