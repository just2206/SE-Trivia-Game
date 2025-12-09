from datetime import date
from .models import DailyChallenge, Quiz

def create_daily_challenge():
    today = date.today()
    if not DailyChallenge.objects.filter(date=today).exists():
        quiz = Quiz.objects.order_by('?').first()
        if quiz:
            DailyChallenge.objects.create(quiz=quiz, date=today)
