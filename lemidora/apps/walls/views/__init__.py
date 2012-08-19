from home import home_page
from upload import upload_image
from edit import update_image, delete_image
from wall import wall_page, wall_status


from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView, View


# ######################### VIEWS FOR TESTING PURPOSES ########################


class UploadPageView(TemplateView):
    template_name = 'walls/upload_page.html'


upload_page = UploadPageView.as_view()


class UploadImageTestView(View):

    def post(self, request, *args, **kwargs):
        for key, file in request.FILES.items():
            filename = file.name

        return HttpResponse(200)


upload_image_test = csrf_exempt(UploadImageTestView.as_view())
