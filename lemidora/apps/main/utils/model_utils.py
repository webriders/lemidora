from datetime import datetime
from django.db import models

class ModifyControlModelMixin(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now_add=True, auto_now=True)

    class Meta:
        abstract=True
