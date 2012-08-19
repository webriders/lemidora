from django.views.generic import TemplateView

class SocialLoginView(TemplateView):
    template_name = 'accounts/social_login_page.html'
