import tkinter as tk
from tkinter import ttk, messagebox

class TriviaApp(tk.Tk):
    """Main application window for the Trivia Game."""
    def __init__(self):
        super().__init__()
        self.title("Trivia Game App")
        self.geometry("600x500")
        self.container = tk.Frame(self)
        self.container.pack(side="top", fill="both", expand=True)

        self.frames = {}
        
        # Initialize all the different screens (frames)
        for F in (LoginScreen, MainMenu, QuizCreationScreen, PlayQuizScreen):
            page_name = F.__name__
            frame = F(parent=self.container, controller=self)
            self.frames[page_name] = frame
            # Position all frames in the same location
            frame.grid(row=0, column=0, sticky="nsew")

        # Start with the Login Screen
        self.show_frame("LoginScreen")

    def show_frame(self, page_name):
        """Show a frame for the given page name."""
        frame = self.frames[page_name]
        frame.tkraise()

# ----------------------------------------------------------------------
# 1. Login/Start Screen (Inferred from 'Logging In' in the file)
# ----------------------------------------------------------------------

class LoginScreen(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller
        
        # Title Label
        label = ttk.Label(self, text="Trivia Game Login", font=("Arial", 18, "bold"))
        label.pack(pady=40, padx=10)

        # Username/Email Entry
        ttk.Label(self, text="Username/Email:").pack(pady=5)
        self.username_entry = ttk.Entry(self, width=30)
        self.username_entry.pack(pady=5)

        # Password Entry
        ttk.Label(self, text="Password:").pack(pady=5)
        self.password_entry = ttk.Entry(self, show="*", width=30)
        self.password_entry.pack(pady=5)

        # Login Button
        login_button = ttk.Button(self, text="Login", command=self.login_user)
        login_button.pack(pady=20)
        
        # Placeholder function for actual login logic
    def login_user(self):
        # In a real app, you would validate credentials here
        username = self.username_entry.get()
        password = self.password_entry.get()
        if username and password:
             # If successful, move to the Main Menu
            messagebox.showinfo("Login", f"Logged in as {username}!")
            self.controller.show_frame("MainMenu")
        else:
             messagebox.showerror("Error", "Please enter both username and password.")

# ----------------------------------------------------------------------
# 2. Main Menu
# ----------------------------------------------------------------------

class MainMenu(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller

        label = ttk.Label(self, text="Main Menu", font=("Arial", 18, "bold"))
        label.pack(pady=40, padx=10)

        # Button for Quiz Creation (if create your own is selected)
        create_button = ttk.Button(self, text="Create a New Quiz", 
                                   command=lambda: controller.show_frame("QuizCreationScreen"))
        create_button.pack(pady=10, ipadx=20, ipady=10)

        # Button for Playing a Quiz (if play a quiz is selected)
        play_button = ttk.Button(self, text="Play a Quiz", 
                                 command=lambda: controller.show_frame("PlayQuizScreen"))
        play_button.pack(pady=10, ipadx=38, ipady=10)
        
        # Logout Button
        logout_button = ttk.Button(self, text="Logout", 
                                   command=lambda: controller.show_frame("LoginScreen"))
        logout_button.pack(pady=40)

# ----------------------------------------------------------------------
# 3. Quiz Creation Screen (Inferred from 'Quiz Creation' and 'Drop down bar')
# ----------------------------------------------------------------------

class QuizCreationScreen(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller
        
        label = ttk.Label(self, text="Create Your Quiz", font=("Arial", 18, "bold"))
        label.pack(pady=20, padx=10)

        # Question Entry
        ttk.Label(self, text="Question Text:").pack(pady=5)
        self.question_text = tk.Text(self, height=3, width=50)
        self.question_text.pack(pady=5)

        self.answer_entries = []
        for i in range(4): # 4 possible answers
            frame = ttk.Frame(self)
            frame.pack(pady=3)
            ttk.Label(frame, text=f"Answer {i+1}:").pack(side=tk.LEFT)
            entry = ttk.Entry(frame, width=40)
            entry.pack(side=tk.LEFT)
            self.answer_entries.append(entry)

        # Drop Down Bar for Correct Answer Choice (Inferred from file)
        ttk.Label(self, text="Select Correct Answer:").pack(pady=10)
        self.correct_answer_var = tk.StringVar()
        choices = [f"Answer {i+1}" for i in range(4)]
        self.correct_answer_menu = ttk.Combobox(self, 
                                               textvariable=self.correct_answer_var, 
                                               values=choices,
                                               state="readonly")
        self.correct_answer_menu.set(choices[0]) # Default value
        self.correct_answer_menu.pack(pady=5)

        # Submit and Back Buttons
        button_frame = ttk.Frame(self)
        button_frame.pack(pady=30)
        
        # 'Last screen' (Implied to be the submit/finish button)
        submit_button = ttk.Button(button_frame, text="Save Quiz", command=self.save_quiz)
        submit_button.pack(side=tk.LEFT, padx=10)

        back_button = ttk.Button(button_frame, text="Back to Menu", 
                                 command=lambda: controller.show_frame("MainMenu"))
        back_button.pack(side=tk.LEFT, padx=10)
        
    def save_quiz(self):
        # In a real app, you would save this question/answers to a database
        messagebox.showinfo("Quiz Saved", "Quiz question has been saved successfully!")
        self.controller.show_frame("MainMenu")

# ----------------------------------------------------------------------
# 4. Play Quiz Screen (Inferred from 'Play Quiz' and feedback)
# ----------------------------------------------------------------------

class PlayQuizScreen(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller
        
        # Placeholder Quiz Data
        self.question_data = {
            "question": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correct_answer_index": 2 # 'Paris'
        }
        
        self.question_label = ttk.Label(self, 
                                        text=self.question_data["question"], 
                                        font=("Arial", 16), 
                                        wraplength=500)
        self.question_label.pack(pady=40, padx=20)
        
        self.answer_buttons = []
        self.feedback_label = ttk.Label(self, text="", font=("Arial", 14), foreground="black")
        self.feedback_label.pack(pady=20)
        
        # Create buttons for multiple-choice options
        for i, text in enumerate(self.question_data["options"]):
            btn = ttk.Button(self, text=text, 
                             command=lambda i=i: self.check_answer(i))
            btn.pack(pady=5, ipadx=20)
            self.answer_buttons.append(btn)
            
        ttk.Button(self, text="Next Question (Placeholder)", 
                   command=self.reset_question).pack(pady=30)
        
        ttk.Button(self, text="Back to Menu", 
                   command=lambda: controller.show_frame("MainMenu")).pack(pady=10)
        
    def check_answer(self, selected_index):
        """Checks the selected answer and provides feedback (Correct/Incorrect)."""
        correct_index = self.question_data["correct_answer_index"]
        
        # Temporarily disable all answer buttons
        for btn in self.answer_buttons:
            btn.config(state=tk.DISABLED)

        # Correct answer selected (Inferred from file)
        if selected_index == correct_index:
            self.feedback_label.config(text="CORRECT! 🎉", foreground="green")
            # In a real app, update the score here
        # Incorrect answer selected (Inferred from file)
        else:
            correct_answer = self.question_data["options"][correct_index]
            self.feedback_label.config(text=f"INCORRECT. The answer was: {correct_answer} ❌", foreground="red")
        
    def reset_question(self):
        """Resets the screen for the next question."""
        self.feedback_label.config(text="", foreground="black")
        for btn in self.answer_buttons:
            btn.config(state=tk.NORMAL)
        # In a real app, this would load a new question from your quiz data

# ----------------------------------------------------------------------
# Run the application
# ----------------------------------------------------------------------

if __name__ == "__main__":
    app = TriviaApp()
    app.mainloop()
