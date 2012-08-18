from datetime import datetime
import uuid
from walls.models import Wall

class WallService(object):

    def create_wall(self, user=None):
        wall = Wall()
        wall.hash = uuid.uuid4()
        wall.owner = user
        wall.save()
        return wall

    def update_wall(self, user, wall_data):
        #TODO: check permission
        wall = self.get_wall(user, wall_data.id)
        wall.title = wall_data.title
        wall.updated_date = datetime.now()
        wall.save()
        return wall

    def delete_wall(self, user, wall_id):
        #TODO: check permission
        wall = self.get_wall(user, wall_id)
        wall.delete()

    def get_wall(self, user, wall_id):
        #TODO: check permission
        wall = Wall.objects.get(id=wall_id)
        return wall
