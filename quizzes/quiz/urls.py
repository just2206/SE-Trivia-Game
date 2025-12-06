from django.urls import path
from . import views
from .views import game

urlpatterns = [
    path('quizzes/', views.PublicQuizList.as_view(), name='public-quizzes'),
    path('quiz/<int:pk>/', views.QuizDetail.as_view(), name='quiz-detail'),
    path('quiz/<int:quiz_id>/start/', views.StartQuizAttempt.as_view(), name='start-quiz'),
    path('quiz/attempt/<int:attempt_id>/question/<int:question_id>/answer/', views.SubmitAnswer.as_view(), name='submit-answer'),
    path('quiz/attempt/<int:attempt_id>/complete/', views.CompleteQuizAttempt.as_view(), name='complete-attempt'),
    path('leaderboard/<int:quiz_id>/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('daily-challenge/', views.DailyChallengeView.as_view(), name='daily-challenge'),
    path('', views.home, name='home'),
    path('game/', game, name='game'),
    path('create/', views.create_quiz, name='create_quiz'),
    path('quizzes/', views.quizzes_list, name='quizzes-list'),
    path('quiz/<int:quiz_id>/', views.quiz_game, name='quiz-game')
]
