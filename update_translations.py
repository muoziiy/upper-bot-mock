import json
import sys

# Read the original file
with open('frontend/src/locales/en.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add parent section
data['parent'] = {
    "hello": "Hello,",
    "track_children_progress": "Track your children's progress",
    "current_level": "Current Level",
    "child_progress": "Child's learning progress",
    "progress_to_next": "Progress to next level",
    "lesson_curriculum": "Lesson Curriculum",
    "selected_child": "Selected Child",
    "my_children": "My Children",
    "groups": "Groups",
    "exams_title": "Exams & Performance",
    "exams_subtitle": "Track your child's exam performance",
    "score": "Score",
    "rank": "Rank",
    "average": "Class Avg",
    "pending": "Pending",
    "subject": "Subject",
    "report_problem": "Report Bot Problem",
    "report_problem_message": "Please describe the issue you're experiencing",
    "logout_confirm": "Logout",
    "logout_message": "Are you sure you want to log out?",
    "logout": "Log Out",
    "app": "App",
    "version": "Version",
    "log_out": "Log Out"
}

# Update common section
data['common']['cancel'] = 'Cancel'
data['common']['send'] = 'Send'

# Write back
with open('frontend/src/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("✓ Updated en.json with parent translations")
