from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.views.generic import View, TemplateView, RedirectView
from walls.facades.wall_facade import WallFacade
from walls.services.wall_service import WallService


class WallPageView(TemplateView):
    template_name = 'walls/main_wall.html'
    facade = WallFacade()

    def get_context_data(self, **kwargs):
        data = super(WallPageView, self).get_context_data(**kwargs)
        wall_key = kwargs.get('wall_id')
        data.update(
            self.facade.get_wall_data(self.request.user, wall_key)
        )
        return data

wall_page = WallPageView.as_view()


class WallStatusView(View):
    facade = WallFacade()

    def get(self, request, *args, **kwargs):
        wall_key = kwargs.get('wall_id')
        return HttpResponse(self.facade.get_wall_json(request.user, wall_key), mimetype="application/json")

wall_status = WallStatusView.as_view()


class CreateWallView(RedirectView):
    permanent = False

    wall_service = WallService()

    def get_redirect_url(self, **kwargs):
        user = self.request.user
        wall = self.wall_service.create_wall(user.is_authenticated() and user or None)

        return reverse('wall', kwargs={'wall_id': wall.hash})

create_wall_view = CreateWallView.as_view()
