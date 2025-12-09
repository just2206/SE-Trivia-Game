from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Quiz, Question, QuizAttempt, AttemptAnswer, LeaderboardEntry, DailyChallenge
from .serializers import QuizSerializer, QuizAttemptSerializer, AttemptAnswerSerializer, LeaderboardEntrySerializer, DailyChallengeSerializer
from django.utils import timezone
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from django.forms import modelformset_factory
from .forms import QuizForm, QuestionForm, BaseQuestionFormSet
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
    return render(request, 'home.html')

def game(request):
    question = Question.objects.first()  # for testing, just grab the first question
    return render(request, 'game.html', {'question': question})

def create_quiz(request):
    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=3, formset=BaseQuestionFormSet)
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
                # skip empty forms
                if not form.cleaned_data or form.cleaned_data.get('DELETE', False):
                    continue
                question = form.save(commit=False)
                question.quiz = quiz
                question.save()

            return redirect('quizzes')  # changed from 'quizzes-list' to 'quizzes'
    else:
        quiz_form = QuizForm()
        QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=3, formset=BaseQuestionFormSet)
        formset = QuestionFormSet(queryset=Question.objects.none())

    return render(request, 'create_quiz.html', {'quiz_form': quiz_form, 'formset': formset})

def quizzes_list(request):
    quizzes = Quiz.objects.filter(is_public=True)
    return render(request, 'quizzes.html', {'quizzes': quizzes})


def quiz_game(request, quiz_id):
    quiz = get_object_or_404(Quiz, pk=quiz_id)

    # get or create a user (anonymous guest fallback)
    user = request.user if request.user.is_authenticated else None
    if not user:
        User = get_user_model()
        user, _ = User.objects.get_or_create(username="guest")

    # Determine whether this user has taken this quiz before (completed attempts)
    has_taken = QuizAttempt.objects.filter(user=user, quiz=quiz, completed_at__isnull=False).exists()

    # Build attempts summary (all attempts for this user and quiz, newest first)
    attempts_qs = QuizAttempt.objects.filter(user=user, quiz=quiz).order_by('-started_at')
    attempts = []
    for att in attempts_qs:
        total = AttemptAnswer.objects.filter(attempt=att).count()
        correct = AttemptAnswer.objects.filter(attempt=att, is_correct=True).count()
        accuracy = round((correct / total * 100), 2) if total > 0 else 0
        attempts.append({'attempt': att, 'total': total, 'correct': correct, 'accuracy': accuracy})

    # Handle a retake request early: create a fresh attempt and start over
    if request.method == 'POST' and request.POST.get('retake'):
        new_attempt = QuizAttempt.objects.create(user=user, quiz=quiz)
        session_key = f'quiz_{quiz_id}_attempt_id'
        request.session[session_key] = new_attempt.id
        return redirect('quiz-game', quiz_id=quiz_id)

    session_key = f'quiz_{quiz_id}_attempt_id'
    attempt = None
    if session_key in request.session:
        try:
            attempt = QuizAttempt.objects.get(pk=request.session[session_key])
        except QuizAttempt.DoesNotExist:
            attempt = None

    if attempt is None:
        attempt = QuizAttempt.objects.create(user=user, quiz=quiz)
        request.session[session_key] = attempt.id

    # helper: ordered list of questions in quiz
    try:
        questions_qs = quiz.questions.all()
    except Exception:
        questions_qs = quiz.question_set.all()
    questions = list(questions_qs.order_by('id'))
    q_total = len(questions)

    # get target question id via query param or pick first unanswered
    requested_qid = request.GET.get('q')
    current_question = None
    if requested_qid:
        current_question = next((q for q in questions if str(q.id) == str(requested_qid)), None)

    # find next unanswered if no requested or requested invalid
    if not current_question:
        answered_qids = AttemptAnswer.objects.filter(attempt=attempt).values_list('question_id', flat=True)
        for q in questions:
            if q.id not in answered_qids:
                current_question = q
                break

    # if still no question -> completed
    if not current_question:
        # compute final stats
        total = AttemptAnswer.objects.filter(attempt=attempt).count()
        correct = AttemptAnswer.objects.filter(attempt=attempt, is_correct=True).count()
        accuracy = (correct / total * 100) if total > 0 else 0
        return render(request, 'game.html', {
            'quiz': quiz,
            'question': None,
            'completed': True,
            'attempt': attempt,
            'accuracy': round(accuracy, 2),
            'has_taken': has_taken,
            'attempts': attempts,
        })

    # compute current question index (1-based)
    try:
        q_index = questions.index(current_question)
        q_number = q_index + 1
    except ValueError:
        q_number = None

    # Handle POST (user answered current question)
    if request.method == 'POST':
        # normal answer submission
        selected = request.POST.get('answer')
        qid = request.POST.get('question_id')
        try:
            qobj = next((q for q in questions if str(q.id) == str(qid)), None)
        except Exception:
            qobj = current_question

        # determine correctness (safe compare)
        is_correct = False
        if qobj and selected is not None:
            # guard: if this question was already answered in this attempt, skip creating a duplicate
            already_answered = AttemptAnswer.objects.filter(attempt=attempt, question=qobj).exists()
            if not already_answered:
                correct_text = (qobj.correct_answer or '').strip().lower()
                is_correct = selected.strip().lower() == correct_text

                # create AttemptAnswer record
                AttemptAnswer.objects.create(
                    attempt=attempt,
                    question=qobj,
                    selected_answer=selected,
                    is_correct=is_correct
                )

                # update attempt score
                if is_correct:
                    attempt.score = (attempt.score or 0) + 1
                    attempt.save()
            else:
                # if already answered, recompute correctness based on existing record
                prev = AttemptAnswer.objects.filter(attempt=attempt, question=qobj).last()
                is_correct = prev.is_correct if prev else False

        # compute accuracy so far
        total = AttemptAnswer.objects.filter(attempt=attempt).count()
        correct = AttemptAnswer.objects.filter(attempt=attempt, is_correct=True).count()
        accuracy = (correct / total * 100) if total > 0 else 0

        # pick next question id
        answered_qids = AttemptAnswer.objects.filter(attempt=attempt).values_list('question_id', flat=True)
        next_question = None
        for q in questions:
            if q.id not in answered_qids:
                next_question = q
                break

        # If there is no next question, finalize the attempt immediately and redirect to completion view
        if not next_question:
            # only mark completed once
            was_completed = bool(attempt.completed_at)
            attempt.completed_at = timezone.now()
            if attempt.started_at and not attempt.time_taken_seconds:
                attempt.time_taken_seconds = int((attempt.completed_at - attempt.started_at).total_seconds())
            attempt.save()

            # create leaderboard entry only the first time we mark completed
            if not was_completed:
                LeaderboardEntry.objects.create(
                    quiz=attempt.quiz,
                    user=attempt.user,
                    score=attempt.score,
                    time_taken_seconds=attempt.time_taken_seconds
                )

            # redirect to GET which will render the completed summary
            return redirect('quiz-game', quiz_id=quiz_id)

        # otherwise, show immediate feedback and schedule client redirect to next question
        return render(request, 'game.html', {
            'quiz': quiz,
            'question': current_question,
            'feedback': {
                'is_correct': is_correct,
                'selected': selected,
                'correct': qobj.correct_answer if qobj else None
            },
            'accuracy': round(accuracy, 2),
            'next_question_id': next_question.id if next_question else None,
            'redirect_after_seconds': 2,
            'attempt': attempt,
            'has_taken': has_taken,
            'attempts': attempts,
            'q_number': q_number,
            'q_total': q_total,
        })

    # GET -> show current question
    return render(request, 'game.html', {'quiz': quiz, 'question': current_question, 'has_taken': has_taken, 'attempts': attempts, 'q_number': q_number, 'q_total': q_total})
