from django.http import HttpResponse
from django.views.generic import TemplateView
from walls.facades.wall_facade import WallFacade
from walls.services.wall_image_service import WallImageService


class UploadImageView(TemplateView):
    facade = WallFacade()
    wall_image_service = WallImageService()

    def post(self, request, *args, **kwargs):
        import time
        time.sleep(15)

        wall_key = kwargs['wall_id']
        user = request.user.is_authenticated() and request.user or None
        x = int(request.POST.get('x'))
        y = int(request.POST.get('y'))

        images = [image for key, image in request.FILES.items() if key.lower().startswith('image')]
        result = self.facade.upload_images(user, wall_key, x, y, images)

        return HttpResponse(result, mimetype="application/json")


upload_image = UploadImageView.as_view()
