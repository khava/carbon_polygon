from django.urls import path

from carbon_polygon import views


urlpatterns = [
    path('', views.main_view, name='main'),
]
