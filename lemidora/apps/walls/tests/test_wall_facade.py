# -*- coding: utf-8 -*-
from django.contrib.auth.models import AnonymousUser

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

    def test_update_image_anonymous(self):
        user = AnonymousUser()
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')
        image = self.image_service.create_image(user, wall, image_data, 0, 0)
        self.image_service.get_image(user, image.id)

        self.facade.update_image(user, wall.hash, image.id, RequestMock(dict(
            x=10, width=900, title="Hello babies"
        )))
        image = self.image_service.get_image(user, image.id)

        self.assertEqual(image.updated_by, None)

    def test_delete_image(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        image_data = get_django_file('ubuntu_grunge_800x600.jpg')
        image = self.image_service.create_image(user, wall, image_data, 0, 0)

        self.facade.delete_image(user, wall.hash, image.id)
        self.assertRaises(WallImage.DoesNotExist, self.image_service.get_image, user, image.id)

    def test_upload_images(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        images = [
            get_django_file('ubuntu_grunge_800x600.jpg'),
            get_django_file('lviv_photo_portrait.jpg'),
            get_django_file('ubuntu_grunge_800x600.png'),
            get_django_file('01.gif'),
            get_django_file(u"very_long_name_very_longvery_Привiт Чуваки! Cлава Українi !long_name_very_long.gif"),
        ]

        self.facade.upload_images(user, wall.hash, 10, 200, images)

        images = self.image_service.get_wall_images(user, wall.id)
        self.assertEqual(len(images), 5)
        self.assertEqual(images[0].x, 10)
        self.assertEqual(images[0].y, 200)
        self.assertTrue('ubuntu_grunge_800x600.jpg' in images[0].image_file.name)

        self.assertEqual(images[1].x, 10 + WallImageService.DEFAULT_X_OFFSET)
        self.assertEqual(images[1].y, 200 + WallImageService.DEFAULT_Y_OFFSET)
        self.assertTrue('lviv_photo_portrait.jpg' in images[1].image_file.name)

        self.assertEqual(images[2].x, 10 + WallImageService.DEFAULT_X_OFFSET * 2)
        self.assertEqual(images[2].y, 200 + WallImageService.DEFAULT_Y_OFFSET * 2)
        self.assertTrue('ubuntu_grunge_800x600.png' in images[2].image_file.name)

        self.assertEqual(images[3].x, 10 + WallImageService.DEFAULT_X_OFFSET * 3)
        self.assertEqual(images[3].y, 200  + WallImageService.DEFAULT_Y_OFFSET * 3)
        self.assertTrue('01.gif' in images[3].image_file.name)

        self.assertEqual(images[4].x, 10 + WallImageService.DEFAULT_X_OFFSET * 4)
        self.assertEqual(images[4].y, 200  + WallImageService.DEFAULT_Y_OFFSET * 4)
        self.assertTrue(u"very_long_name_very_longvery_Привiт Чуваки! Cлава Українi !long_name_very_long.gif" in images[4].image_file.name)

    def test_upload_images_anonymous(self):
        user = AnonymousUser()
        wall = self.wall_service.create_wall(user)

        images = [
            get_django_file('ubuntu_grunge_800x600.jpg'),
        ]

        self.facade.upload_images(user, wall.hash, 10, 200, images)

        images = self.image_service.get_wall_images(user, wall.id)

        self.assertEqual(images[0].created_by, None)
        self.assertEqual(images[0].updated_by, None)

    def test_upload_images_broken(self):
        user = create_user('dojo')
        wall = self.wall_service.create_wall(user)

        images = [
            get_django_file('ubuntu_grunge_800x600.jpg'),
            get_django_file('lviv_broken.jpg'),
            get_django_file('broken_txt.jpg'),
        ]

        self.facade.upload_images(user, wall.hash, 10, 200, images)

        images = self.image_service.get_wall_images(user, wall.id)
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0].x, 10)
        self.assertEqual(images[0].y, 200)
        self.assertTrue('ubuntu_grunge_800x600.jpg' in images[0].image_file.name)
