from datetime import date, datetime
from django.db import models

class ModifyControlModelMixin(object):
    created_date = models.DateTimeField(default=datetime.now)
    updated_date = models.DateTimeField(default=datetime.now)

