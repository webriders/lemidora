from django.http import HttpResponse
from django.views.generic import View
from walls.facades.wall_facade import WallFacade
from walls.forms import UpdateImageForm
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService


class DeleteImageView(View):
    """
    Request: {URL}/delete/?image_id=1
    """
    facade = WallFacade()
    image_service = WallImageService()

    def get(self, request, *args, **kwargs):
        wall_key = kwargs.get('wall_id')
        image_id = request.REQUEST.get('image_id')
        self.image_service.delete_image(request.user, image_id)
        return HttpResponse(self.facade.get_wall_json(request.user, wall_key), mimetype="application/json")

delete_image = DeleteImageView.as_view()


class UpdateImageView(View):
    """
    Request: {URL}/update/?image_id=1&x=&y=&z=&title=&rotation=
    """
    facade = WallFacade()
    image_service = WallImageService()
    wall_service = WallService()

    def get(self, request, *args, **kwargs):
        wall_key = kwargs.get('wall_id')
        wall = self.wall_service.get_wall_by_hash(request.user, wall_key)
        image_id = request.REQUEST.get('image_id')
        form = UpdateImageForm(request.REQUEST)
        if form.is_valid():
            image_data = form.save(commit=False)
            image_data.wall_id = wall.id
            image_data.id = image_id
            self.image_service.update_image(request.user, image_data)
        else:
            #TODO: move errors to json
            print str(form.errors)
        return HttpResponse(self.facade.get_wall_json(request.user, wall_key), mimetype="application/json")

update_image = UpdateImageView.as_view()
