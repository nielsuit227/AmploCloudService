from django.contrib import admin
from django.urls import path, include
from core import views

urlpatterns = [
    path('', views.index),
    path('healthz', views.index),
    path('api/admin/', admin.site.urls),
    path('api/', include('app.urls')),
    path('api/auth/', include('users.urls')),
]
