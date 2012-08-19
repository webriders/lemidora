import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View, TemplateView
from main.utils.messages_utils import MessagesContextManager
from walls.facades.wall_facade import WallFacade
from walls.services.wall_image_service import WallImageService


class UploadImageView(TemplateView):
    facade = WallFacade()
    wall_image_service = WallImageService()

    def post(self, request, *args, **kwargs):
        wall_key = kwargs['wall_id']
        user = request.user.is_authenticated() and request.user or None
        x = int(request.POST.get('x'))
        y = int(request.POST.get('y'))

        images = [image for key, image in request.FILES.items() if key.lower().startswith('image')]
        result = self.facade.upload_images(user, wall_key, x, y, images)

        return HttpResponse(result, mimetype="application/json")


upload_image = csrf_exempt(UploadImageView.as_view())
