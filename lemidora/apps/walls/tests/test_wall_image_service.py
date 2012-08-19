from django.test import TestCase
from main.utils.test_utils import create_user
from sorl.thumbnail.images import ImageFile
from walls.models import WallImage
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService
from walls.tests.utils import get_django_file


class TestWallImageService(TestCase):
    image_service = WallImageService()
    wall_service = WallService()

    def test_create_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = WallImage(image_file=get_django_file('ubuntu_grunge_800x600.jpg'))
        image_data.wall_id = wall.id

        image = self.image_service.create_image(user, image_data)
        image = self.image_service.get_image(user, image.id)

        self.assertIsInstance(image, WallImage)
        self.assertEqual(image.created_by, user)
        self.assertEqual(image.updated_by, user)
        self.assertEqual(image.width, WallImageService.DEFAULT_WIDTH)
        self.assertEqual(image.height, WallImageService.DEFAULT_HEIGHT)
        # self.assertEqual(image.image_file.name, 'spring_ubuntu_1900x1200.jpg')
        self.assertIsInstance(image.thumbnail, ImageFile)
        self.assertTrue(hasattr(image, 'thumbnail'))
        self.assertEqual(image.thumbnail.width, WallImageService.DEFAULT_WIDTH)
        self.assertEqual(image.thumbnail.height, WallImageService.DEFAULT_HEIGHT)

    def test_update_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = WallImage(image_file=get_django_file('ubuntu_grunge_800x600.jpg'))
        image_data.wall_id = wall.id
        old_image = self.image_service.create_image(user, image_data)

        image_data = WallImage(
            id=old_image.id,
            x=4.2, y=2.2, z=2, rotation=22.2,
            width=500, height=700,
            title='I am swimming in the woods'
        )
        image_data.wall_id = wall.id

        updater = create_user('updater')
        image = self.image_service.update_image(updater, image_data)
        image = self.image_service.get_image(user, image.id)

        self.assertIsInstance(image, WallImage)
        self.assertEqual(image.created_by, user)
        self.assertEqual(image.updated_by, updater)
        self.assertEqual(image.created_date, old_image.created_date)

        self.assertEqual(image.image_file.name, old_image.image_file.name)

        self.assertEqual(image.width, 500)
        self.assertEqual(image.height, 700)
        self.assertEqual(image.x, 4.2)
        self.assertEqual(image.y, 2.2)
        self.assertEqual(image.rotation, 22.2)
        self.assertEqual(image.title, 'I am swimming in the woods')

        self.assertIsInstance(image.thumbnail, ImageFile)
        self.assertTrue(hasattr(image, 'thumbnail'))
        self.assertEqual(image.thumbnail.width, 500)
        self.assertEqual(image.thumbnail.height, 700)

    def test_create_images(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_file_list = [
            get_django_file('ubuntu_grunge_800x600.jpg'),
            get_django_file('ubuntu_black_1440x900.jpg'),
            get_django_file('ubuntu_grunge_800x600.jpg'),
        ]

        images = self.image_service.create_images(user, wall.id, image_file_list, 10, 20)
        self.assertEqual(len(images), 3)

        self.assertEqual(images[0].x, 10)
        self.assertEqual(images[0].y, 20)

        self.assertEqual(images[1].x, 10 + WallImageService.DEFAULT_X_OFFSET)
        self.assertEqual(images[1].y, 20 + WallImageService.DEFAULT_Y_OFFSET)

        self.assertEqual(images[2].x, 10 + WallImageService.DEFAULT_X_OFFSET * 2)
        self.assertEqual(images[2].y, 20 + WallImageService.DEFAULT_Y_OFFSET * 2)
