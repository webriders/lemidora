from django.test import TestCase
from main.utils.test_utils import create_user
from walls.models import Wall
from walls.services.wall_service import WallService

class TestWallService(TestCase):
    wall_service = WallService()

    def test_create_anonymous_wall(self):
        wall = self.wall_service.create_wall()

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
