from django.urls import path
from . import views
from .views import game

urlpatterns = [
    # Home + game
    path('', views.home, name='home'),
    path('game/', game, name='game'),

    # Quizzes list page (HTML page)
    path('quizzes/', views.quizzes_list, name='quizzes'),

    # Create quiz
    path('create/', views.create_quiz, name='create_quiz'),

    # Quiz game page (HTML)
    path('quiz/<int:quiz_id>/', views.quiz_game, name='quiz-game'),

    # API endpoints (DO NOT collide with HTML pages)
    path('api/quizzes/', views.PublicQuizList.as_view(), name='public-quizzes'),
    path('api/quiz/<int:pk>/', views.QuizDetail.as_view(), name='quiz-detail'),
    path('api/quiz/<int:quiz_id>/start/', views.StartQuizAttempt.as_view(), name='start-quiz'),
    path('api/quiz/attempt/<int:attempt_id>/question/<int:question_id>/answer/', views.SubmitAnswer.as_view(), name='submit-answer'),
    path('api/quiz/attempt/<int:attempt_id>/complete/', views.CompleteQuizAttempt.as_view(), name='complete-attempt'),
    path('api/leaderboard/<int:quiz_id>/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('api/daily-challenge/', views.DailyChallengeView.as_view(), name='daily-challenge'),
]

