from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView, View


class HomePageView(TemplateView):
    template_name = 'main/home_page.html'


home_page = HomePageView.as_view()


class UploadPageView(TemplateView):
    template_name = 'walls/upload_page.html'


upload_page = UploadPageView.as_view()


class UploadImageView(View):

    def post(self, request, *args, **kwargs):
        for key, file in request.FILES.items():
            filename = file.name

        return HttpResponse(200)


upload_image = csrf_exempt(UploadImageView.as_view())
