from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Quiz, Question, QuizAttempt, AttemptAnswer, LeaderboardEntry, DailyChallenge
from .serializers import QuizSerializer, QuizAttemptSerializer, AttemptAnswerSerializer, LeaderboardEntrySerializer, DailyChallengeSerializer
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from django.forms import modelformset_factory
from .forms import QuizForm, QuestionForm
import random

# Public quizzes
class PublicQuizList(generics.ListAPIView):
    serializer_class = QuizSerializer

    def get_queryset(self):
        return Quiz.objects.filter(is_public=True)

# Quiz details
class QuizDetail(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

# Start a quiz attempt
class StartQuizAttempt(APIView):
    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        attempt = QuizAttempt.objects.create(user=request.user, quiz=quiz)
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Submit an answer
class SubmitAnswer(APIView):
    def post(self, request, attempt_id, question_id):
        attempt = get_object_or_404(QuizAttempt, pk=attempt_id)
        question = get_object_or_404(Question, pk=question_id)
        selected_answer = request.data.get('selected_answer')

        is_correct = selected_answer.strip().lower() == question.correct_answer.strip().lower()
        answer_obj = AttemptAnswer.objects.create(
            attempt=attempt,
            question=question,
            selected_answer=selected_answer,
            is_correct=is_correct
        )

        # Update score
        if is_correct:
            attempt.score += 1
            attempt.save()

        serializer = AttemptAnswerSerializer(answer_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Complete a quiz attempt
class CompleteQuizAttempt(APIView):
    def post(self, request, attempt_id):
        attempt = get_object_or_404(QuizAttempt, pk=attempt_id)
        attempt.completed_at = timezone.now()
        # Optional: calculate time taken
        if attempt.started_at:
            attempt.time_taken_seconds = int((attempt.completed_at - attempt.started_at).total_seconds())
        attempt.save()

        # Add leaderboard entry
        LeaderboardEntry.objects.create(
            quiz=attempt.quiz,
            user=attempt.user,
            score=attempt.score,
            time_taken_seconds=attempt.time_taken_seconds
        )

        return Response({'status': 'completed', 'score': attempt.score})

# Leaderboard
class LeaderboardView(generics.ListAPIView):
    serializer_class = LeaderboardEntrySerializer

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        return LeaderboardEntry.objects.filter(quiz_id=quiz_id).order_by('-score', 'time_taken_seconds')

# Daily challenge
class DailyChallengeView(APIView):
    def get(self, request):
        today = timezone.localdate()
        challenge = DailyChallenge.objects.filter(date=today).first()
        serializer = DailyChallengeSerializer(challenge)
        return Response(serializer.data)

def home(request):
    return render(request, 'quiz/home.html')

def game(request):
    question = Question.objects.first()  # for testing, just grab the first question
    return render(request, 'quiz/game.html', {'question': question})

def create_quiz(request):
    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=3)
    if request.method == "POST":
        quiz_form = QuizForm(request.POST)
        formset = QuestionFormSet(request.POST, queryset=Question.objects.none())
        if quiz_form.is_valid() and formset.is_valid():
            quiz = quiz_form.save(commit=False)  # don't save yet
            # assign a guest user
            User = get_user_model()
            guest, created = User.objects.get_or_create(username="guest")
            quiz.creator = guest
            quiz.save()  # now save the quiz

            for form in formset:
                question = form.save(commit=False)
                question.quiz = quiz
                question.save()

            return redirect('quizzes-list')
    else:
        quiz_form = QuizForm()
        formset = QuestionFormSet(queryset=Question.objects.none())

    return render(request, 'quiz/create_quiz.html', {'quiz_form': quiz_form, 'formset': formset})

def quizzes_list(request):
    quizzes = Quiz.objects.filter(is_public=True)
    return render(request, 'quizzes.html', {'quizzes': quizzes})

def quiz_game(request, quiz_id):
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    return render(request, 'quiz_game.html', {'quiz': quiz})
