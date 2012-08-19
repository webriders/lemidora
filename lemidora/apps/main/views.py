from django.views.generic.base import TemplateView


class HomePageView(TemplateView):
    template_name = 'main/home_page.html'


home_page = HomePageView.as_view()
