from django.test import TestCase
from main.utils.test_utils import create_user
from walls.models import Wall, WallImage
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
        image_data.wall_id=wall.id

        image = self.image_service.create_image(user, image_data)

        self.assertIsInstance(image, WallImage)
        self.assertEqual(image.created_by, user)
        self.assertEqual(image.updated_by, user)
        # self.assertEqual(image.image_file.name, 'spring_ubuntu_1900x1200.jpg')

