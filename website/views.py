from django.shortcuts import render


def application(request):
    return render(request, 'website/index.html')
