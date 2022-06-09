from django.shortcuts import render


def main_view(request):
    return render(request, 'main.html')


def carbon_view(request):
    return render(request, 'carbon.html')
