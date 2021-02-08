from django.shortcuts import HttpResponse

def index(request):
    return HttpResponse("<html><body><h1>API</h1></body></html>")
    