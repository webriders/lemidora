from django.contrib.auth.models import User, AnonymousUser
from django.test import TestCase
from main.utils.test_utils import create_user
from sorl.thumbnail.images import ImageFile
from walls.models import WallImage
from walls.services.wall_image_service import WallImageService, LimitError
from walls.services.wall_service import WallService
from walls.tests.utils import get_django_file


class TestWallImageService(TestCase):
    image_service = WallImageService()
    wall_service = WallService()

    def test_create_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_file = get_django_file('ubuntu_grunge_800x600.jpg')

        image = self.image_service.create_image(user, wall, image_file, 0, 0)
        image = self.image_service.get_image(user, image.id)

        self.assertIsInstance(image, WallImage)
        self.assertEqual(image.created_by, user)
        self.assertEqual(image.updated_by, user)
        self.assertEqual(image.width, WallImageService.DEFAULT_WIDTH)
        self.assertEqual(image.height, 240)
        self.assertTrue('ubuntu_grunge_800x600.jpg' in image.image_file.name)
        self.assertIsInstance(image.thumbnail, ImageFile)
        self.assertTrue(hasattr(image, 'thumbnail'))
        self.assertEqual(image.thumbnail.width, WallImageService.DEFAULT_WIDTH)
        self.assertEqual(image.thumbnail.height, 240)

    def test_create_check_limit(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        saved_limit = WallImageService.WALL_UPLOAD_LIMIT
        WallImageService.WALL_UPLOAD_LIMIT = 3

        self.image_service.create_image(user, wall, get_django_file('ubuntu_grunge_800x600.jpg'), 0, 0)
        self.image_service.create_image(user, wall, get_django_file('lviv_photo_portrait.jpg'), 0, 0)
        self.image_service.create_image(user, wall, get_django_file('ubuntu_grunge_800x600.png'), 0, 0)
        self.assertRaises(LimitError, self.image_service.create_image, user, wall, get_django_file('01.gif'), 0, 0)

        WallImageService.WALL_UPLOAD_LIMIT = saved_limit


    def test_update_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')

        old_image = self.image_service.create_image(user, wall, image_data, 0, 0)

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

    def test_get_geometry(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')

        image = self.image_service.create_image(user, wall, image_data, 0, 0)

        width, height = self.image_service._get_geometry(image.image_file)
        self.assertEqual(width, WallImageService.DEFAULT_WIDTH)
        self.assertEqual(height, 240)

        image_data = get_django_file('ubuntu_portrait.jpg')

        image = self.image_service.create_image(user, wall, image_data, 0,0 )

        width, height = self.image_service._get_geometry(image.image_file)
        self.assertEqual(height, WallImageService.DEFAULT_HEIGHT)
        self.assertEqual(width, 242)


    def test_format_geometry(self):
        image = WallImage(width=None, height=300)
        self.assertEqual(self.image_service._format_geometry(image), "x300")

        image = WallImage(width=123, height=None)
        self.assertEqual(self.image_service._format_geometry(image), "123")

        image = WallImage(width=123, height=321)
        self.assertEqual(self.image_service._format_geometry(image), "123x321")

        image = WallImage(width=None, height=None)
        self.assertEqual(self.image_service._format_geometry(image), str(WallImageService.DEFAULT_WIDTH))

    def test_get_user_title(self):
        self.assertEqual(self.image_service._get_user_title(User(first_name='Goga', username="gogi")), 'Goga')
        self.assertEqual(self.image_service._get_user_title(User(last_name='Goga', username="gogi")), 'Goga')
        self.assertEqual(self.image_service._get_user_title(User(username="gogi")), 'gogi')
        self.assertEqual(self.image_service._get_user_title(User(first_name="", last_name="", username="gogi")), 'gogi')
        self.assertEqual(self.image_service._get_user_title(User(first_name="Goga", last_name="Gogi", username="gogi")), 'Goga Gogi')

        self.assertEqual(self.image_service._get_user_title(None), None)
        self.assertEqual(self.image_service._get_user_title(AnonymousUser()), None)
