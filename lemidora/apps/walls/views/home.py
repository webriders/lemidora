from django.core.urlresolvers import reverse
from django.views.generic import  RedirectView
from walls.services.wall_service import WallService


class HomePageView(RedirectView):
    permanent = False

    wall_service = WallService()

    def get_redirect_url(self, **kwargs):
        user = self.request.user
        wall = self.wall_service.create_wall(user.is_authenticated() and user or None)

        return reverse('wall', kwargs={'wall_id': wall.hash})


home_page = HomePageView.as_view()
