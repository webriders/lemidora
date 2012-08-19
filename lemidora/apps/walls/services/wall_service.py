from main.utils.uniq_generators import id_generator
from walls.models import Wall
from walls.services.wall_image_service import WallImageService


class WallService(object):

    image_service = WallImageService()

    def create_wall(self, user=None):
        """
        Create a new wall
        :param user: owner, can be none or AnonymouseUser
        :return: created Wall
        """
        wall = Wall()
        wall.hash = self.__generate_key()
        if user and user.is_authenticated():
            wall.owner = user
        wall.save()
        return wall

    def __generate_key(self):
        """
        Generate unique key for Wall
        :return: key (6 symbols)
        """
        for i in xrange(10):  # try 10 times
            key = id_generator()
            if not Wall.objects.filter(hash=key).exists():
                return key
        raise ValueError('Wrong generator! 10 times unique key generation did not return unique value.')

    def update_wall(self, user, wall_data):
        """
        Update Wall
        :param user: author of update
        :param wall_data: Wall-like object
        :return: updated Wall
        """
        # TODO: check permission
        wall = self.get_wall(user, wall_data.id)
        wall.title = wall_data.title
        wall.save()
        return wall

    def fork_wall(self, user, wall_id):
        """
        Fork wall. Makes a wall copy with all images.
        :param user: owner of a forked Wall
        :param wall_id: wall id to be forked from
        :return: forked Wall
        """

        # TODO: check permission
        source_wall = self.get_wall(user, wall_id)
        forked_wall = self.create_wall(user)
        forked_wall.title = source_wall.title
        forked_wall.save()
        images = self.image_service.get_wall_images(user, source_wall.id)
        for source_image in images:
            self.image_service.fork_image(user, forked_wall, source_image)
        return forked_wall

    def delete_wall(self, user, wall_id):
        """
        Delete the Wall
        :param user: author of delete op.
        :param wall_id: Wall id
        :return: None
        """
        # TODO: check permission
        wall = self.get_wall(user, wall_id)
        wall.delete()

    def get_wall(self, user, wall_id):
        # TODO: check permission
        wall = Wall.objects.get(id=wall_id)
        return wall

    def get_wall_by_hash(self, user, hash):
        # TODO: check permission
        return Wall.objects.get(hash=hash)
