from django.views.generic import View


class HomePageView(View):
    template_name = 'main/home_page.html'


home_page = HomePageView.as_view()
