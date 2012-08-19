from django.core.files.uploadedfile import SimpleUploadedFile
import os


def get_file(filename):
    return open(os.path.join(os.path.dirname(__file__), 'images', filename))


def get_django_file(filename):
    file = get_file(filename)
    return SimpleUploadedFile(filename, file.read())
