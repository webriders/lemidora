import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View, TemplateView
from main.utils.messages_utils import MessagesContextManager
from walls.services.wall_image_service import WallImageService


class UploadImageView(TemplateView):
    wall_image_service = WallImageService()
    template_name = 'walls/upload_page.html'

    def post(self, request, *args, **kwargs):
        wall_key = kwargs['wall_id']
        user = request.user.is_authenticated() and request.user or None

        messages_manager = MessagesContextManager()

        for key, file in request.FILES.items():
            fn = file.name
            with messages_manager('File %s successfully uploaded!' % fn,
                'There is error occurred while uploading %s image! :(' % fn):
                self.wall_image_service.create_images(user, wall_key, [file])

        status = None  # TODO: call wall status service and obtain current wall status info
        result = {
            'messages': messages_manager.get_messages(),
            'status': status
        }

        return HttpResponse(json.dumps(result), mimetype="application/json")


upload_image = csrf_exempt(UploadImageView.as_view())
