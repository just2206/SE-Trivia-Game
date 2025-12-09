from django.contrib import admin
from .models import (
    Quiz,
    Question,
    QuizAttempt,
    AttemptAnswer,
    LeaderboardEntry,
    DailyChallenge,
    Lobby,
    GameSession
)

# ---------------------------
# Quiz Admin
# ---------------------------
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'creator', 'is_public', 'is_timed', 'time_limit_seconds', 'created_at']
    search_fields = ['title', 'creator__username']
    list_filter = ['is_public', 'is_timed']
    readonly_fields = ['created_at']

# ---------------------------
# Question Admin
# ---------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'text', 'question_type', 'correct_answer']
    search_fields = ['text']
    list_filter = ['question_type']

# ---------------------------
# QuizAttempt Admin
# ---------------------------
@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'quiz', 'score', 'started_at', 'completed_at', 'time_taken_seconds']
    search_fields = ['user__username', 'quiz__title']
    readonly_fields = ['started_at', 'completed_at']

# ---------------------------
# AttemptAnswer Admin
# ---------------------------
@admin.register(AttemptAnswer)
class AttemptAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'attempt', 'question', 'selected_answer', 'is_correct']
    search_fields = ['question__text', 'selected_answer']
    list_filter = ['is_correct']

# ---------------------------
# LeaderboardEntry Admin
# ---------------------------
@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'user', 'score', 'time_taken_seconds', 'created_at']
    search_fields = ['quiz__title', 'user__username']
    readonly_fields = ['created_at']

# ---------------------------
# DailyChallenge Admin
# ---------------------------
@admin.register(DailyChallenge)
class DailyChallengeAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'date']
    search_fields = ['quiz__title']
    list_filter = ['date']

# ---------------------------
# Lobby Admin
# ---------------------------
@admin.register(Lobby)
class LobbyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'host', 'is_public', 'created_at']
    search_fields = ['name', 'host__username']
    list_filter = ['is_public']
    readonly_fields = ['created_at']

# ---------------------------
# GameSession Admin
# ---------------------------
@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'lobby', 'quiz', 'started_at', 'completed_at']
    search_fields = ['lobby__name', 'quiz__title']
    readonly_fields = ['started_at', 'completed_at']

