import os
from channels.routing import get_default_application
from django.core.asgi import get_asgi_application
from .routing import application as channels_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quizzes.settings')

django_asgi_app = get_asgi_application()

# Final ASGI app: HTTP requests go to Django, WebSocket requests go to Channels
application = channels_application
