import json
import datetime
from main.utils.messages_utils import MessagesContextManager
from walls.forms import UpdateImageForm
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService


class WallFacade(object):
    wall_service = WallService()
    image_service = WallImageService()

    def get_wall(self, user, hash):
        wall = self.wall_service.get_wall_by_hash(user, hash)
        images = self.image_service.get_wall_images(user, wall.id)
        return wall, images

    def get_wall_data(self, user, hash):
        wall, images = self.get_wall(user, hash)

        return dict(
            wall=wall,
            images=images
        )

    def get_wall_json(self, user, wall_key, messages_context_manager):
        json_data = {}
        if not messages_context_manager.is_critical_failure:
            json_data = self._get_wall_json(user, wall_key, messages_context_manager)

        json_data['messages'] = messages_context_manager.get_messages()

        date_handler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else None
        return json.dumps(json_data, indent=4, default=date_handler)

    def _get_wall_json(self, user, wall_key, messages_context_manager):
        json_data = {}

        with messages_context_manager:
            wall, images = self.get_wall(user, wall_key)
            json_data = {
                'wall': dict(
                    title=wall.title,
                    id=wall.id,
                    key=wall.hash,
                    owner=wall.owner.get_full_name() if wall.owner else None,
                    created_date=wall.created_date,
                ),
                'images': [
                dict(
                    id=image.id,
                    title=image.title,
                    x=image.x,
                    y=image.y,
                    z=image.z,
                    rotation=image.rotation,
                    width=image.width,
                    height=image.height,
                    url=image.thumbnail.url,
                    created_by=image.created_by.get_full_name() if image.created_by else None,
                    created_date=image.created_date or None,
                    updated_by=image.updated_by.get_full_name() if image.updated_by else None,
                    updated_date=image.updated_date or None,
                ) for image in images
                ]
            }
        return json_data

    def delete_image(self, user, wall_key, image_id):
        messages_manager = MessagesContextManager()
        with messages_manager(critical=True):
            self.image_service.delete_image(user, image_id)
        return self.get_wall_json(user, wall_key, messages_manager)

    def update_image(self, user, wall_key, image_id, request):
        messages_manager = MessagesContextManager()

        with messages_manager(critical=True, error="Wall not found by key: %s" % str(wall_key)):
            wall = self.wall_service.get_wall_by_hash(user, wall_key)

        if not messages_manager.is_critical_failure:
            with messages_manager():
                form = UpdateImageForm(request.REQUEST)
                if form.is_valid():
                    image_data = form.save(commit=False)
                    image_data.wall_id = wall.id
                    image_data.id = image_id
                    self.image_service.update_image(user, image_data)
                else:
                    for form_error in form.errors:
                        messages_manager.error(str(form_error))
        return self.get_wall_json(user, wall_key, messages_manager)

    def upload_images(self, user, wall_key, x, y, images):
        messages_manager = MessagesContextManager()

        if not x:
            x = self.image_service.DEFAULT_X_OFFSET
        if not y:
            y = self.image_service.DEFAULT_Y_OFFSET

        with messages_manager(error="Wall with key '%s' not found! :(" % wall_key, critical=True):
            wall = self.wall_service.get_wall_by_hash(user, wall_key)

        if not messages_manager.is_critical_failure:
            self._upload_images(user, wall, x, y, images, messages_manager)

        return self.get_wall_json(user, wall_key, messages_manager)

    def _upload_images(self, user, wall, x, y, images, messages_manager):
        for image in images:
            with messages_manager('File %s successfully uploaded!' % image.name,
                'There is error occurred while uploading %s image! :(' % image.name):

                self.image_service.create_image(user, wall, image, x, y)

            x += self.image_service.DEFAULT_X_OFFSET
            y += self.image_service.DEFAULT_Y_OFFSET
