from django.db.models import Max
from sorl.thumbnail.images import ImageFile
from sorl.thumbnail.shortcuts import get_thumbnail
from walls.models import WallImage
from sorl.thumbnail import default


class LimitError(Exception):
    pass


class WallImageService(object):
    DEFAULT_WIDTH = 300
    DEFAULT_HEIGHT = 300

    CROP_MODE = 'center'

    THUMBNAIL_QUALITY = 95

    DEFAULT_X_OFFSET = 20
    DEFAULT_Y_OFFSET = 20

    EXIF_ORIENTATION_TAG = 274

    WALL_UPLOAD_LIMIT = 30

    def create_image(self, user, wall, image_file, x, y):
        """
        Create list of images
        :param user: User instance
        :param wall: Wall instance
        :param image_file: image file instance
        :param x: X coordinate
        :param y: Y coordinate
        """
        self.check_is_upload_allowed(wall_id=wall.id)
        image = WallImage()
        try:
            image = WallImage()
            self.__update_image_system_data(user, image, wall, image_file)

            base_z = WallImage.objects.filter(wall=wall).aggregate(Max('z')).values().pop() or 0

            image.z = base_z + 1
            image.x = x
            image.y = y

            image.width = self.DEFAULT_WIDTH
            image.height = self.DEFAULT_HEIGHT
#            print "Init: %sx%s" % (str(image.width), str(image.height))
            image.save()

            image.width, image.height = self._get_geometry(image.image_file)
#            print "Geometry: %sx%s" % (str(image.width), str(image.height))

            self._add_dynamics(image)
            image.width = image.thumbnail.width
            image.height = image.thumbnail.height
#            print "Th: %sx%s" % (str(image.width), str(image.height))
            image.save()
        except IOError, e:
            # This is the broken image case
            # delete should also remove the file?
            image.delete()
            raise e
        return image

    def _get_geometry(self, image_file):
        image = ImageFile(image_file)
        source_image = default.engine.get_image(image)
        size = default.engine.get_image_size(source_image)
        print "GEOM: %sx%s" % (str(size[0]), str(size[1]))
        image.set_size(size)

        exif_rotated = False

        if hasattr(source_image, '_getexif'):
            exif = source_image._getexif()
            orientation = exif and exif.get(self.EXIF_ORIENTATION_TAG, 0)
            exif_rotated = orientation in (6, 8)

        actual_size = exif_rotated and size[::-1] or size
        width, height = actual_size

        if width >= height:
            height = height*self.DEFAULT_WIDTH/width
            width = self.DEFAULT_WIDTH
        else:
            width = width*self.DEFAULT_WIDTH/height
            height = self.DEFAULT_WIDTH

        return width, height

    def __update_image_user_data(self, image, image_data):
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

    def __update_image_system_data(self, user, image, wall, image_file):
        image.wall = wall
        image.image_file = image_file
        if user and user.is_authenticated():
            image.created_by = user
            image.updated_by = user

    def fork_image(self, user, forked_wall, source_image):
        forked_image = WallImage(wall=forked_wall, image_file=source_image.image_file)
        self.__update_image_user_data(forked_image, source_image)
        self.__update_image_system_data(user, forked_image, forked_wall, source_image.image_file)
        forked_image.save()
        return forked_image

    def update_image(self, user, image_data):
        # TODO: check permission

        image = self.get_image(user, image_data.id)

        self.__update_image_user_data(image, image_data)
        if user and user.is_authenticated():
            image.updated_by = user

        image.save()
        self._add_dynamics(image)
        return image

    def _format_geometry(self, image):
        if not image.height and not image.width:
            return "%s" % str(self.DEFAULT_WIDTH)
        if not image.height:
            return '%s' % str(image.width)
        if not image.width:
            return 'x%s' % str(image.height)
        return '%sx%s' % (image.width, image.height)

    def _add_dynamics(self, image):
        self._add_thumbnail(image)
        image.created_by_title = self._get_user_title(image.created_by)
        image.updated_by_title = self._get_user_title(image.updated_by)

    def _get_user_title(self, user):
        if user and user.is_authenticated():
            return user.get_full_name() or user.username
        else:
            return None

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
        self._add_dynamics(image)
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
            self._add_dynamics(image)
        return images

    def get_wall_image_count(self, user, wall_id):
        # TODO: check permission
        return WallImage.objects.filter(wall=wall_id).count()

    def check_is_upload_allowed(self, wall_id):
        if WallImage.objects.filter(wall=wall_id).count() < self.WALL_UPLOAD_LIMIT:
            return True
        raise LimitError("You have reached '%d' images limit for one Wall" % self.WALL_UPLOAD_LIMIT)
