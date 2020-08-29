"""Tracer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from api.views import QueryES, GetASN, GetAllFilterItems
from website.views import application

urlpatterns = [
    path('', application, name="application"),
    path('api/query', QueryES.as_view(), name="query_es"),
    path('api/aggregations/<str:ipv4>', GetAllFilterItems.as_view(), name="aggregations"),
    path('api/asn/<str:asn>', GetASN.as_view(), name="get_asn"),
]
