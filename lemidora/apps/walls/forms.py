from django.forms import ModelForm
from walls.models import WallImage

class UpdateImageForm(ModelForm):

    def __init__(self, *args, **kwargs):
        super(UpdateImageForm, self).__init__(*args, **kwargs)
        for key, field in self.fields.iteritems():
            self.fields[key].required = False
            pass

    class Meta:
        model = WallImage
        fields = ('title', 'x', 'y', 'z', 'rotation', 'width', 'height')