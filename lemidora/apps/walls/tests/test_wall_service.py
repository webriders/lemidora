from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from main.utils.test_utils import create_user
from walls.models import Wall
from walls.services.wall_image_service import WallImageService
from walls.services.wall_service import WallService
from walls.tests.utils import get_django_file


class TestWallService(TestCase):
    wall_service = WallService()
    image_service = WallImageService()

    def test_create_anonymous_wall(self):
        wall = self.wall_service.create_wall()

        self.assertIsInstance(wall, Wall)
        self.assertIsNotNone(wall.hash)
        self.assertEqual(wall.owner, None)

        user = AnonymousUser()
        wall = self.wall_service.create_wall(user)
        self.assertIsInstance(wall, Wall)
        self.assertIsNotNone(wall.hash)
        self.assertEqual(wall.owner, None)

    def test_create_wall(self):
        user = create_user('goga')
        wall = self.wall_service.create_wall(user=user)

        self.assertIsInstance(wall, Wall)
        self.assertIsNotNone(wall.hash)
        self.assertEqual(wall.owner, user)

    def test_update_wall(self):
        user = create_user('goga')
        wall = self.wall_service.create_wall(user=user)

        wall_data = Wall(id=wall.id, title="Hello babies")
        wall = self.wall_service.update_wall(user, wall_data)

        db_wall = self.wall_service.get_wall(user, wall.id)

        self.assertIsInstance(wall, Wall)
        self.assertIsNotNone(wall.hash)
        self.assertEqual(db_wall.owner, user)
        self.assertEqual(db_wall.title, "Hello babies")

    def test_fork_wall(self):
        user = create_user('goga')
        source_wall = self.wall_service.create_wall(user=user)

        image_file = get_django_file('ubuntu_grunge_800x600.jpg')
        self.image_service.create_image(user, source_wall, image_file, 0, 0)
        image_file = get_django_file('ubuntu_portrait.jpg')
        self.image_service.create_image(user, source_wall, image_file, 100, 200)
        wall_data = Wall(id=source_wall.id, title="Hello babies")
        source_wall = self.wall_service.update_wall(user, wall_data)

        forker = create_user('forker')
        forked_wall = self.wall_service.fork_wall(forker, source_wall.id)

        self.assertNotEqual(source_wall.id, forked_wall.id)
        self.assertEqual(source_wall.title, forked_wall.title)
        self.assertEqual(source_wall.owner.id, user.id)
        self.assertEqual(forked_wall.owner.id, forker.id)

        source_images = self.image_service.get_wall_images(user, source_wall.id)
        forked_images = self.image_service.get_wall_images(forker, forked_wall.id)
        self.assertEqual(len(source_images), len(forked_images))

        for i in xrange(len(source_images)):
            self.assertNotEqual(source_images[i].wall.id, forked_images[i].wall.id)
            self.assertNotEqual(source_images[i].id, forked_images[i].id)
            self.assertNotEqual(source_images[i].created_by.id, forked_images[i].created_by.id)

            self.assertEqual(source_images[i].x, forked_images[i].x)
            self.assertEqual(source_images[i].y, forked_images[i].y)
            self.assertEqual(source_images[i].width, forked_images[i].width)
            self.assertEqual(source_images[i].height, forked_images[i].height)
            self.assertEqual(source_images[i].image_file.name, forked_images[i].image_file.name)
