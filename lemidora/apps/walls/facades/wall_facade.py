import json
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService

class WallFacade(object):
    wall_service = WallService()
    image_service = WallImageService()

    def get_wall_data(self, user, hash):
        wall = self.wall_service.get_wall_by_hash(user, hash)
        images = self.image_service.get_wall_images(user, wall.id)

        return dict(
            wall=wall,
            images=images
        )

    def get_wall_json(self, user, hash):
        data = self.get_wall_data(user, hash)
        wall = data['wall']
        images = data['images']

        json_data = {
            'wall': dict(
                title=wall.title,
                id=wall.id,
                key=wall.hash,
                owner=wall.owner.get_full_name() if wall.owner else None,
#                created_date=wall.created_date,
            ),
            'images': [
                dict(
                    title=image.title,
                    x=image.x,
                    y=image.y,
                    z=image.z,
                    rotation=image.rotation,
                    width=image.width,
                    height=image.height,
                    url=image.thumbnail.url,
                    created_by=image.created_by.get_full_name(),
#                    created_date=image.created_date or None,
                    updated_by=image.updated_by.get_full_name() if image.updated_by else None,
#                    updated_date=image.updated_date or None,
                ) for image in images
            ]
        }
        return json.dumps(json_data, indent=4)
