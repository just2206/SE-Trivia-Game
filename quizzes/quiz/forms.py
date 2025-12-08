from django import forms
from .models import Quiz, Question
from django.forms.widgets import HiddenInput
from django.forms import BaseModelFormSet

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['title', 'is_public', 'is_timed', 'time_limit_seconds']

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['text', 'question_type', 'correct_answer', 'option_a', 'option_b', 'option_c', 'option_d']
        widgets = {
            # keep correct_answer present but hidden — we'll manage it from the template with checkboxes
            'correct_answer': HiddenInput(),
        }
        labels = {
            'text': 'Question',
            'option_a': 'A',
            'option_b': 'B',
            'option_c': 'C',
            'option_d': 'D',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # make correct_answer optional on the form (we'll populate it via JS)
        self.fields['correct_answer'].required = False

        # Ensure question_type select exists and options are available; leave option fields as plain text inputs
        # No automatic conversion of correct_answer into ChoiceField here — template will show checkboxes/radios
        # For backward compatibility, if an instance has a correct_answer value, keep it as initial
        instance = kwargs.get('instance', None)
        if instance and getattr(instance, 'correct_answer', None):
            self.initial['correct_answer'] = instance.correct_answer

        # Do not replace correct_answer with a ChoiceField here — template JS will read option values

class BaseQuestionFormSet(BaseModelFormSet):
    def clean(self):
        super().clean()
        if any(self.errors):
            # If forms have local errors already, skip additional checks
            return

        for i, form in enumerate(self.forms):
            # cleaned_data may be empty for extra unused forms
            if not hasattr(form, 'cleaned_data'):
                continue
            data = form.cleaned_data
            # ignore entirely-empty forms (all fields empty)
            if not data or all((data.get(f) in (None, '') for f in ['text','question_type','option_a','option_b','option_c','option_d','correct_answer'])):
                # skip empty form
                continue

            text = data.get('text')
            qtype = data.get('question_type')
            correct = data.get('correct_answer')

            if not text:
                form.add_error('text', 'Question text is required.')

            if not correct:
                # highlight correct_answer field where appropriate
                form.add_error('correct_answer', 'Please select a correct answer.')

            if qtype == 'MC':
                # ensure at least one non-empty option exists
                opts = [data.get('option_a'), data.get('option_b'), data.get('option_c'), data.get('option_d')]
                if not any(opt for opt in opts if opt and str(opt).strip()):
                    form.add_error('option_a', 'At least one option (A-D) is required for multiple choice.')
