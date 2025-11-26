import json

# Russian translations
with open('frontend/src/locales/ru.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['parent'] = {
    "hello": "Привет,",
    "track_children_progress": "Отслеживайте прогресс ваших детей",
    "current_level": "Текущий уровень",
    "child_progress": "Прогресс обучения ребёнка",
    "progress_to_next": "Прогресс до следующего уровня",
    "lesson_curriculum": "Программа уроков",
    "selected_child": "Выбранный ребёнок",
    "my_children": "Мои дети",
    "groups": "Группы",
    "exams_title": "Экзамены и успеваемость",
    "exams_subtitle": "Отслеживайте успеваемость вашего ребёнка",
    "score": "Балл",
    "rank": "Ранг",
    "average": "Средний балл",
    "pending": "Ожидается",
    "subject": "Предмет",
    "report_problem": "Сообщить о проблеме",
    "report_problem_message": "Пожалуйста, опишите проблему",
    "logout_confirm": "Выход",
    "logout_message": "Вы уверены, что хотите выйти?",
    "logout": "Выйти",
    "app": "Приложение",
    "version": "Версия",
    "log_out": "Выйти"
}

data['common']['cancel'] = 'Отмена'
data['common']['send'] = 'Отправить'

with open('frontend/src/locales/ru.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("✓ Updated ru.json")

# Uzbek translations
with open('frontend/src/locales/uz.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['parent'] = {
    "hello": "Salom,",
    "track_children_progress": "Farzandlaringiz muvaffaqiyatini kuzatib boring",
    "current_level": "Joriy daraja",
    "child_progress": "Bolaning o'qish jarayoni",
    "progress_to_next": "Keyingi darajaga o'tish",
    "lesson_curriculum": "Dars dasturi",
    "selected_child": "Tanlangan farzand",
    "my_children": "Mening farzandlarim",
    "groups": "Guruhlar",
    "exams_title": "Imtihonlar va natijalar",
    "exams_subtitle": "Farzandingiz imtihon natijalarini kuzating",
    "score": "Ball",
    "rank": "Daraja",
    "average": "O'rtacha ball",
    "pending": "Kutilmoqda",
    "subject": "Fan",
    "report_problem": "Muammo haqida xabar berish",
    "report_problem_message": "Iltimos, muammoni tasvirlab bering",
    "logout_confirm": "Chiqish",
    "logout_message": "Haqiqatan ham chiqmoqchimisiz?",
    "logout": "Chiqish",
    "app": "Ilova",
    "version": "Versiya",
    "log_out": "Chiqish"
}

data['common']['cancel'] = 'Bekor qilish'
data['common']['send'] = 'Yuborish'

with open('frontend/src/locales/uz.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("✓ Updated uz.json")
print("\n✅ All translation files updated successfully!")
