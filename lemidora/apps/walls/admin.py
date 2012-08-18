from django.contrib import admin
from sorl.thumbnail.admin import AdminImageMixin
from walls.models import Wall, WallImage

class WallAdmin(admin.ModelAdmin):
    save_on_top = True
    save_as = True
    list_display = ('hash', 'title', 'owner')
    list_filter = ('owner',)

admin.site.register(Wall, WallAdmin)

class WallImageAdmin(AdminImageMixin, admin.ModelAdmin):
    save_on_top = True
    save_as = True
    list_display = ('image_file', 'wall', 'title', 'created_by', 'updated_by', 'updated_date')
    list_filter = ('wall',)

admin.site.register(WallImage, WallImageAdmin)