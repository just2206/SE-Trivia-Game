import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Quiz, QuizAttempt, AttemptAnswer
from asgiref.sync import sync_to_async

class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['lobby_id']
        self.group_name = f'lobby_{self.lobby_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Example message structure: {'type': 'answer', 'user_id': 1, 'question_id': 2, 'answer': 'A'}
        await self.handle_message(data)

    async def handle_message(self, data):
        msg_type = data.get('type')
        if msg_type == 'answer':
            await self.save_answer(data)
            # Broadcast updated score or feedback
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'score_update',
                    'user_id': data['user_id'],
                    'question_id': data['question_id'],
                    'answer': data['answer']
                }
            )

    @sync_to_async
    def save_answer(self, data):
        from django.contrib.auth import get_user_model
        user = get_user_model().objects.get(pk=data['user_id'])
        attempt = QuizAttempt.objects.filter(user=user, quiz_id=data['quiz_id']).last()
        question = Quiz.objects.get(pk=data['quiz_id']).questions.get(pk=data['question_id'])
        is_correct = data['answer'].strip().lower() == question.correct_answer.strip().lower()
        AttemptAnswer.objects.create(
            attempt=attempt,
            question=question,
            selected_answer=data['answer'],
            is_correct=is_correct
        )
        if is_correct:
            attempt.score += 1
            attempt.save()

    async def score_update(self, event):
        await self.send(text_data=json.dumps(event))

