from sorl.thumbnail.shortcuts import get_thumbnail
from walls.models import WallImage

class WallImageService(object):
    DEFAULT_WIDTH = 200
    DEFAULT_HEIGHT = 200
    CROP_MODE = 'center'
    DEFAULT_X_OFFSET = 20
    DEFAULT_Y_OFFSET = 20

    def create_images(self, user, wall_id, image_file_list, x=None, y=None):
        """
        Create list of images
        :param user: User
        :param x: basic coordinate
        :param y: basic coordinate
        :param wall_id: Wall id
        :param image_file_list: list of uploaded Files
        :return: list of created WallImage
        """

        if not x:
            x = self.DEFAULT_X_OFFSET
        if not y:
            y = self.DEFAULT_Y_OFFSET

        images = []
        for image_file in image_file_list:
            image_data = WallImage(
                x=x, y=y, image_file=image_file, wall_id=wall_id
            )
            images.append(self.create_image(user, image_data))
            x += self.DEFAULT_X_OFFSET
            y += self.DEFAULT_Y_OFFSET
        return images

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
