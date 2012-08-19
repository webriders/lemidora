from sorl.thumbnail.shortcuts import get_thumbnail
from walls.models import WallImage
from walls.services.wall_service import WallService


class WallImageService(object):
    DEFAULT_WIDTH = 200
    DEFAULT_HEIGHT = 200
    CROP_MODE = 'center'
    DEFAULT_X_OFFSET = 20
    DEFAULT_Y_OFFSET = 20

    wall_service = WallService()

    def create_image(self, user, wall, image, x, y):
        """
        Create list of images
        :param user: User instance
        :param wall: Wall instance
        :param image: image file instance
        :param x: X coordinate
        :param y: Y coordinate
        """

        image_data = WallImage(x=x, y=y, image_file=image, wall=wall)
        self._create_image(user, image_data)

    def _create_image(self, user, image_data):
        # TODO: check permission

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
        if image_data.x is not None:
            image.x = image_data.x
        if image_data.y is not None:
            image.y = image_data.y
        if image_data.z is not None:
            image.z = image_data.z
        if image_data.rotation is not None:
            image.rotation = image_data.rotation
        if image_data.width is not None:
            image.width = image_data.width
        if image_data.height is not None:
            image.height = image_data.height

    def update_image(self, user, image_data):
        # TODO: check permission

        image = self.get_image(user, image_data.id)

        self.__update_image_data(image, image_data)

        image.updated_by = user

        image.save()
        self.add_thumbnail(image)
        return image

    def add_thumbnail(self, image):
        image.thumbnail = get_thumbnail(
            image.image_file,
            '%sx%s' % (image.width or self.DEFAULT_WIDTH, image.height or self.DEFAULT_HEIGHT),
            crop=self.CROP_MODE,
            quality=99
        )

    def delete_image(self, user, id):
        # TODO: check permission
        image = self.get_image(user, id)
        image.delete()

    def get_image(self, user, id):
        # TODO: check permission
        image = WallImage.objects.get(id=id)
        self.add_thumbnail(image)
        return image

    def get_wall_images(self, user, wall_id):
        # TODO: check permission
        images = list(WallImage.objects.filter(wall=wall_id))
        for image in images:
            self.add_thumbnail(image)
        return images
