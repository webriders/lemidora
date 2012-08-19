from django.contrib.auth.models import User
from django.db import models
from main.utils.model_utils import ModifyControlModelMixin
from sorl.thumbnail import ImageField
import os


def wall_upload_dir(instance, filename):
    return os.path.join(instance.wall.hash, filename)


class Wall(ModifyControlModelMixin):
    title = models.CharField(max_length=256, blank=True, null=True)
    hash = models.CharField(max_length=64, unique=True)
    owner = models.ForeignKey(User, blank=True, null=True)

    class Meta:
        pass

    def __unicode__(self):
        return str(self.title) + ': %s' % self.owner or 'anonymous'


class WallImage(ModifyControlModelMixin):
    title = models.CharField(max_length=256, blank=True, null=True)
    wall = models.ForeignKey(Wall)

    # Image position
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    z = models.IntegerField(default=0)
    rotation = models.FloatField(default=0)

    # Image dimensions
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)

    # Link to image
    image_file = ImageField(upload_to=wall_upload_dir)

    # Update management
    created_by = models.ForeignKey(User, blank=True, null=True, related_name='created_by')
    updated_by = models.ForeignKey(User, blank=True, null=True, related_name='updated_by')

    # dynamic attributes added by service
    thumbnail = None

    class Meta:
        pass

    def __unicode__(self):
        return "%s: %s" % (self.image_file, self.title or 'Untitled')


#class Image(models.Model, ModifyControlModelMixin):
#    #TODO: Create AbstractImage (updated, )
#    image_file = ImageField()
#
#    def __unicode__(self):
#        return self.image_file

#class Thumbnail(models.Model, ModifyControlModelMixin):
#    image = models.ForeignKey(Image)
#    image_file = ImageField()
#    width = models.IntegerField(default=0)
#    height = models.IntegerField(default=0)
#
#    def __unicode__(self):
#        return "%s: [%d x %d]" % (self.image.image_file, self.width, self.height)
