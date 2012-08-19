from django.contrib.auth.models import User


def create_user(name, email=None, password=None, first_name=None, last_name=None):
    user = User()
    user.username = name
    user.first_name = first_name or ""
    user.last_name = last_name or ""
    user.set_password(password or '1')

    if email:
        user.email = email
    else:
        user.email = name + '@' + name

    user.save()
    return user
