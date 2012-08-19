from django.views.generic import View


class WallPageView(View):
    pass


wall_page = WallPageView.as_view()


class WallStatusView(View):
    pass


wall_status = WallStatusView.as_view()
