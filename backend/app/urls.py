from django.urls import path, re_path
from app import views

urlpatterns = [
    path('getModels/', views.getModels.as_view()),
    path('changeModel/', views.changeModel.as_view())
]