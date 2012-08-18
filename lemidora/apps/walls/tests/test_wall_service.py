from django.test import TestCase
from walls.models import Wall
from walls.services.wall_service import WallService

class TestWallService(TestCase):
    wall_service = WallService()

    def test_create_wall(self):
        wall = self.wall_service.create_wall()

        self.assertIsInstance(wall, Wall)
        self.assertEqual(wall.hash, "")
        self.assertEqual(wall.owner, None)
