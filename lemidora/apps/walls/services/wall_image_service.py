from sorl.thumbnail.shortcuts import get_thumbnail
from walls.models import WallImage

class WallImageService(object):
    DEFAULT_WIDTH = 200
    DEFAULT_HEIGHT = 200
    CROP_MODE = 'center'

    def create_image(self, user, image_data):
        #TODO: check permission
        image = WallImage()
        image.wall_id = image_data.wall_id
        image.image_file = image_data.image_file
        image.created_by = user
        image.updated_by = user
        self.__update_image_data(image, image_data)
        image.width = self.DEFAULT_WIDTH
        image.height = self.DEFAULT_HEIGHT
        image.save()
        self.add_thumbnail(image)
        return image

    def __update_image_data(self, image, image_data):
        image.title = image_data.title
        image.x = image_data.x
        image.y = image_data.y
        image.z = image_data.z
        image.rotation = image_data.rotation
        image.width = image_data.width
        image.height = image_data.height

    def update_image(self, user, image_data):
        #TODO: check permission
        image = self.get_image(user, image_data.id)

        self.__update_image_data(image, image_data)

        image.updated_by = user

        image.save()
        self.add_thumbnail(image)
        return image

    def add_thumbnail(self, image):
        image.thumbnail = get_thumbnail(
            image.image_file,
            '%sx%s' % (image.width or self.DEFAULT_WIDTH , image.height or self.DEFAULT_HEIGHT),
            crop=self.CROP_MODE,
            quality=99
        )

    def delete_image(self, user, id):
        #TODO: check permission
        image = self.get_image(user, id)
        image.delete()

    def get_image(self, user, id):
        #TODO: check permission
        image = WallImage.objects.get(id=id)
        self.add_thumbnail(image)
        return image
