from django import forms
from .models import Quiz, Question

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['title', 'is_public', 'is_timed', 'time_limit_seconds']

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['text', 'question_type', 'correct_answer', 'option_a', 'option_b', 'option_c', 'option_d']

