from main.utils.uniq_generators import id_generator
from walls.models import Wall


class WallService(object):

    def create_wall(self, user=None):
        wall = Wall()
        wall.hash = self.generate_key()
        wall.owner = user
        wall.save()
        return wall

    def generate_key(self):
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
        # TODO: check permission
        wall = self.get_wall(user, wall_data.id)
        wall.title = wall_data.title
        wall.save()
        return wall

    def delete_wall(self, user, wall_id):
        # TODO: check permission
        wall = self.get_wall(user, wall_id)
        wall.delete()

    def get_wall(self, user, wall_id):
        # TODO: check permission
        wall = Wall.objects.get(id=wall_id)
        return wall
