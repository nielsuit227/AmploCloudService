from django.urls import path, include
from users import views


urlpatterns = [
    path('login/', views.CustomLoginView.as_view(), name='api_login'),
    path('logout/', views.APILogoutView.as_view(), name='api_lougout'),
    path('update_password/', views.APIPasswordUpdateView.as_view(), name='api_update_password'),
    path('create_user/', views.APICreateUser.as_view()),
]