from django.http import HttpResponse
from django.views.generic import View
from walls.facades.wall_facade import WallFacade


class DeleteImageView(View):
    """
    Request: {URL}/delete/?image_id=1
    """
    facade = WallFacade()

    def post(self, request, *args, **kwargs):
        wall_key = kwargs.get('wall_id')
        image_id = request.REQUEST.get('image_id')
        response_json = self.facade.delete_image(request.user, wall_key, image_id)
        return HttpResponse(response_json, mimetype="application/json")

delete_image = DeleteImageView.as_view()


class UpdateImageView(View):
    """
    Request: {URL}/update/?image_id=1&x=&y=&z=&title=&rotation=
    """
    facade = WallFacade()

    def post(self, request, *args, **kwargs):
        wall_key = kwargs.get('wall_id')
        image_id = request.REQUEST.get('image_id')
        response_json = self.facade.update_image(request.user, wall_key, image_id, request)
        return HttpResponse(response_json, mimetype="application/json")

update_image = UpdateImageView.as_view()
