from django.test import TestCase
from main.utils.test_utils import create_user
from walls.facades.wall_facade import WallFacade
from walls.models import WallImage
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService
from walls.tests.utils import get_django_file


class RequestMock(object):
    def __init__(self, REQUEST):
        self.REQUEST = REQUEST

class TestWallFacade(TestCase):
    facade = WallFacade()
    wall_service = WallService()
    image_service = WallImageService()

    def test_update_image_full_params_set(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')
        image = self.image_service.create_image(user, wall, image_data, 0, 0)

        self.facade.update_image(user, wall.hash, image.id, RequestMock(dict(
            x=10, y=20, rotation=200, width=900, height=800, z=-1, title="Hello babies"
        )))
        image = self.image_service.get_image(user, image.id)

        self.assertEqual(image.title, 'Hello babies')
        self.assertEqual(image.x, 10)
        self.assertEqual(image.y, 20)
        self.assertEqual(image.z, -1)
        self.assertEqual(image.rotation, 200)
        self.assertEqual(image.width, 900)
        self.assertEqual(image.height, 800)
        self.assertEqual(image.thumbnail.width, 900)
        self.assertEqual(image.thumbnail.height, 800)

    def test_update_image_limited_params_set(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')
        image = self.image_service.create_image(user, wall, image_data, 0, 0)
        old_image = self.image_service.get_image(user, image.id)

        self.facade.update_image(user, wall.hash, image.id, RequestMock(dict(
            x=10, width=900, title="Hello babies"
        )))
        image = self.image_service.get_image(user, image.id)

        self.assertEqual(image.title, 'Hello babies')
        self.assertEqual(image.x, 10)
        self.assertEqual(image.y, old_image.y)
        self.assertEqual(image.z, old_image.z)
        self.assertEqual(image.rotation, old_image.rotation)
        self.assertEqual(image.width, 900)
        self.assertEqual(image.height, old_image.height)
        self.assertEqual(image.thumbnail.width, 900)
        self.assertEqual(image.thumbnail.height, old_image.height)

    def test_delete_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')
        image = self.image_service.create_image(user, wall, image_data, 0, 0)

        self.facade.delete_image(user, wall.hash, image.id)
        self.assertRaises(WallImage.DoesNotExist, self.image_service.get_image, user, image.id)
