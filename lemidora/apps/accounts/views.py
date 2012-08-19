from django.views.generic import TemplateView


class SocialLoginPageView(TemplateView):
    template_name = 'accounts/social_login_page.html'

    def get_context_data(self, **kwargs):
        context = super(SocialLoginPageView, self).get_context_data(**kwargs)
        context['redirect_url'] = self.request.GET.get('next') or '/'
        return context


social_login_page = SocialLoginPageView.as_view()


class SocialLoginCompleteView(TemplateView):
    template_name = "accounts/social_login_completed_page.html"

    def get_context_data(self, **kwargs):
        context = super(SocialLoginCompleteView, self).get_context_data(**kwargs)
        context['social_auth_status'] = self.request.user.is_authenticated() and 'success' or 'error'

        return context


social_login_complete = SocialLoginCompleteView.as_view()
