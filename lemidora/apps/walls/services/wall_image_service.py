from sorl.thumbnail.images import ImageFile
from sorl.thumbnail.shortcuts import get_thumbnail
from walls.models import WallImage
from walls.services.wall_service import WallService
from sorl.thumbnail import default


class WallImageService(object):
    DEFAULT_WIDTH = 300
    DEFAULT_HEIGHT = 300

    CROP_MODE = 'center'

    THUMBNAIL_QUALITY = 95

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

        width, height = self._get_geometry(image.image_file)
        image.width = width
        image.height = height
        self._add_thumbnail(image)
        image.width = image.thumbnail.width
        image.height = image.thumbnail.height
        image.save()
        return image

    def _get_geometry(self, image_file):
        image = ImageFile(image_file)
        source_image = default.engine.get_image(image)
        size = default.engine.get_image_size(source_image)
        image.set_size(size)
        if image.is_portrait():
            return None, self.DEFAULT_HEIGHT
        else:
            return self.DEFAULT_WIDTH, None

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
        self._add_thumbnail(image)
        return image

    def _format_geometry(self, image):
        if not image.height and not image.width:
            return "%s" % str(self.DEFAULT_WIDTH)
        if not image.height:
            return '%s' % str(image.width)
        if not image.width:
            return 'x%s' % str(image.height)
        return '%sx%s' % (image.width, image.height)

    def _add_thumbnail(self, image):
        """
        Generates thumbnail for wall display and set as .thumbnail attribute.
        It is important that all WallImage instances used at views has this thumbnail.
        :param image:
        :return: None
        """
        geometry = self._format_geometry(image)

        image.thumbnail = get_thumbnail(
            image.image_file,
            geometry,
            crop=self.CROP_MODE,
            quality=self.THUMBNAIL_QUALITY
        )

    def delete_image(self, user, id):
        """
        Delete image by id
        :param user: user
        :param id: image id
        :return: None
        """
        # TODO: check permission
        image = self.get_image(user, id)
        image.delete()

    def get_image(self, user, id):
        """
        Get image by id
        :param user: user
        :param id: image id
        :return: WallImage
        """
        # TODO: check permission
        image = WallImage.objects.get(id=id)
        self._add_thumbnail(image)
        return image

    def get_wall_images(self, user, wall_id):
        """
        Get list of wall images, with thumbnail attached.
        Can be used to render wall.
        :param user: user
        :param wall_id: Wall id
        :return: list of WallImage
        """
        # TODO: check permission
        images = list(WallImage.objects.filter(wall=wall_id))
        for image in images:
            self._add_thumbnail(image)
        return images
