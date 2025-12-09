from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from quiz.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('', include('quiz.urls')),
]

