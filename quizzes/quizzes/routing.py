from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from quiz.consumers import LobbyConsumer

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter([
            re_path(r'ws/lobby/(?P<lobby_id>\w+)/$', LobbyConsumer.as_asgi()),
        ])
    ),
})
