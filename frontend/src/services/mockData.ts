import { UserLevel } from '../types/journey.types';

// --- Mutable Data Store ---

// 1. Users with Emojis and Correct Names
export let MOCK_USERS = {
    student: {
        id: 'student_1',
        first_name: 'Jahongir',
        last_name: "Po'latov",
        username: 'jahongir_p',
        role: 'student',
        student_id: 'ST-2023-001',
        sex: 'male',
        emoji: '👨‍🎓'
    },
    teacher: {
        id: 'teacher_1',
        first_name: 'Sarah',
        last_name: 'Teacher',
        username: 'sarah_teacher',
        role: 'teacher',
        emoji: '👩‍🏫'
    },
    admin: {
        id: 'admin_1',
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin_user',
        role: 'admin',
        emoji: '🛡️'
    },
    parent: {
        id: 'parent_1',
        first_name: 'John',
        last_name: 'Parent',
        username: 'john_parent',
        role: 'parent',
        emoji: '👨‍👩‍👦'
    }
};

// 2. Dashboard Data (Mutable)
export let MOCK_DASHBOARD_DATA = {
    student: {
        user: MOCK_USERS.student,
        streak: {
            current_streak: 5,
            longest_streak: 12,
            total_active_days: 45
        },
        total_stats: {
            total_study_minutes: 1250,
            total_tests: 15,
            total_questions: 300
        },
        average_score: 85,
        upcoming_exams: [
            { id: 'exam_1', title: 'Midterm English', date: '2023-12-10T10:00:00', subject: 'English' },
            { id: 'exam_2', title: 'Physics Quiz', date: '2023-12-15T14:00:00', subject: 'Physics' }
        ],
        lessons: [
            {
                id: 'lesson_1',
                title: 'Present Perfect Tense',
                subject_id: 'sub_1',
                status: 'completed',
                description: 'Learn how to use the present perfect tense correctly.',
                scheduled_date: '2023-12-01T14:00:00',
                is_online: false,
                location: 'Room 101'
            },
            {
                id: 'lesson_2',
                title: "Newton's Laws",
                subject_id: 'sub_2',
                status: 'in_progress',
                description: 'Understanding the three laws of motion.',
                scheduled_date: '2023-12-03T10:00:00',
                is_online: true,
                location: 'Zoom'
            },
            {
                id: 'lesson_3',
                title: 'Algebra Basics',
                subject_id: 'sub_3',
                status: 'coming',
                description: 'Introduction to variables and equations.',
                scheduled_date: '2023-12-05T09:00:00',
                is_online: false,
                location: 'Room 202'
            }
        ],
        homework: [
            {
                id: 'hw_1',
                title: 'Essay on Holiday',
                lesson_id: 'lesson_1',
                due_date: '2023-12-05',
                status: 'pending',
                description: 'Write a 200-word essay about your last holiday.'
            }
        ],
        subjects: [
            { id: 'sub_1', name: 'English', progress: 75 },
            { id: 'sub_2', name: 'Physics', progress: 40 },
            { id: 'sub_3', name: 'Mathematics', progress: 60 }
        ],
        groups: [
            {
                id: 'g1',
                name: 'English A1',
                status: 'active',
                teacher: MOCK_USERS.teacher,
                payments: [
                    { id: 'p1', amount: 150000, date: '2023-11-01', status: 'paid' },
                    { id: 'p2', amount: 150000, date: '2023-10-01', status: 'paid' },
                    { id: 'p3', amount: 150000, date: '2023-12-01', status: 'pending' }
                ],
                attendance: [
                    { date: '2023-11-20', status: 'present' },
                    { date: '2023-11-18', status: 'present' },
                    { date: '2023-11-15', status: 'absent' }
                ]
            },
            {
                id: 'g2',
                name: 'Physics Basics',
                status: 'active',
                teacher: { ...MOCK_USERS.teacher, first_name: 'Albert', last_name: 'Einstein', emoji: '👨‍🔬' },
                payments: [
                    { id: 'p4', amount: 200000, date: '2023-11-05', status: 'paid' }
                ],
                attendance: [
                    { date: '2023-11-21', status: 'present' }
                ]
            }
        ]
    }
};

export let MOCK_TEACHER_DATA = {
    groups: [
        { id: 'g1', name: 'English A1', student_count: 12, next_class: 'Today, 14:00' },
        { id: 'g2', name: 'English B2', student_count: 8, next_class: 'Tomorrow, 10:00' },
        { id: 'g3', name: 'IELTS Prep', student_count: 5, next_class: 'Wed, 16:00' }
    ],
    stats: {
        total_students: 25,
        active_groups: 3,
        upcoming_exams_count: 2
    },
    schedule: [
        { id: 's1', title: 'English A1', group: 'English A1', time: '14:00 - 15:30', location: 'Room 101', date: new Date() },
        { id: 's2', title: 'English B2', group: 'English B2', time: '10:00 - 11:30', location: 'Room 102', date: new Date(Date.now() + 86400000) }
    ],
    messages: []
};

export let MOCK_ADMIN_DATA = {
    stats: {
        total_students: 150,
        total_teachers: 12,
        total_revenue: 15000000,
        active_groups: 15
    },
    requests: [
        { id: 'req_1', user_id: 'u_101', status: 'pending', created_at: '2023-12-01', users: { first_name: 'New', last_name: 'Student', username: 'new_student', emoji: '👤' } },
        { id: 'req_2', user_id: 'u_102', status: 'pending', created_at: '2023-12-02', users: { first_name: 'Another', last_name: 'Teacher', username: 'new_teacher', emoji: '👤' } }
    ]
};

export let MOCK_JOURNEY_DATA = {
    userLevel: {
        user_id: 'student_1',
        current_level: UserLevel.INTERMEDIATE,
        progress_percentage: 45,
        level_started_at: '2023-09-01',
        updated_at: '2023-12-01'
    },
    curriculum: [
        { id: 'c1', level: UserLevel.BEGINNER, name: 'Beginner', description: 'Start your journey', order_index: 1, is_active: true, created_at: '', updated_at: '' },
        { id: 'c2', level: UserLevel.ELEMENTARY, name: 'Elementary', description: 'Basics', order_index: 2, is_active: true, created_at: '', updated_at: '' },
        { id: 'c3', level: UserLevel.PRE_INTERMEDIATE, name: 'Pre-Intermediate', description: 'Getting better', order_index: 3, is_active: true, created_at: '', updated_at: '' },
        { id: 'c4', level: UserLevel.INTERMEDIATE, name: 'Intermediate', description: 'Fluent basics', order_index: 4, is_active: true, created_at: '', updated_at: '' }
    ],
    lessons: [
        { id: 'l1', curriculum_id: 'c4', title: 'Advanced Grammar', description: 'Deep dive', content: null, duration_minutes: 45, topics: ['Grammar'], order_index: 1, is_active: true, created_at: '', updated_at: '', status: 'completed' },
        { id: 'l2', curriculum_id: 'c4', title: 'Speaking Skills', description: 'Conversation', content: null, duration_minutes: 45, topics: ['Speaking'], order_index: 2, is_active: true, created_at: '', updated_at: '', status: 'unlocked' },
        { id: 'l3', curriculum_id: 'c4', title: 'Writing Essays', description: 'Structure', content: null, duration_minutes: 60, topics: ['Writing'], order_index: 3, is_active: true, created_at: '', updated_at: '', status: 'locked' }
    ],
    exams: {
        upcoming: [],
        old: [],
        overall: []
    }
};

export let MOCK_STUDENT_EXAMS = [
    {
        id: 'exam_1',
        title: 'Midterm English',
        description: 'Midterm examination covering all topics from the first half of the semester.',
        duration_minutes: 60,
        type: 'online',
        questions: [{ count: 20 }],
        scheduled_date: '2023-12-10T10:00:00',
        student_status: 'pending',
        score: undefined
    },
    {
        id: 'exam_2',
        title: 'Physics Quiz',
        description: "Quick quiz on Newton's laws.",
        duration_minutes: 30,
        type: 'offline',
        questions: [{ count: 10 }],
        scheduled_date: '2023-12-15T14:00:00',
        student_status: 'pending',
        score: undefined
    },
    {
        id: 'exam_3',
        title: 'History Final',
        description: 'Final exam for History class.',
        duration_minutes: 90,
        type: 'offline',
        questions: [{ count: 50 }],
        scheduled_date: '2023-11-20T09:00:00',
        student_status: 'graded',
        score: 88
    }
];

export let MOCK_TEACHER_EXAMS = [
    {
        id: 'exam_t1',
        title: 'Midterm English',
        description: 'Midterm examination covering all topics from the first half of the semester.',
        duration_minutes: 60,
        type: 'online',
        questions: [{ count: 20 }],
        exam_assignments: [{ count: 12 }],
        created_at: '2023-11-25T10:00:00'
    },
    {
        id: 'exam_t2',
        title: 'Physics Quiz',
        description: "Quick quiz on Newton's laws.",
        duration_minutes: 30,
        type: 'offline',
        questions: [{ count: 10 }],
        exam_assignments: [{ count: 8 }],
        created_at: '2023-12-01T14:00:00'
    }
];

export let MOCK_TEACHER_PAYMENTS = [
    { id: 'tp1', amount: 5000000, payment_date: '2023-11-30', description: 'Salary for November', status: 'paid' },
    { id: 'tp2', amount: 5000000, payment_date: '2023-10-31', description: 'Salary for October', status: 'paid' },
    { id: 'tp3', amount: 5000000, payment_date: '2023-09-30', description: 'Salary for September', status: 'paid' }
];

export let MOCK_EXAM_SUBMISSIONS = [
    {
        id: 'sub_1',
        submitted_at: '2023-12-05T10:30:00',
        score: 0,
        answers: { 'q1': '4', 'q2': 'Gravity is a force.' },
        student: { first_name: 'Jahongir', last_name: "Po'latov" }
    },
    {
        id: 'sub_2',
        submitted_at: '2023-12-05T10:35:00',
        score: 0,
        answers: { 'q1': '3', 'q2': 'I dont know.' },
        student: { first_name: 'Shahzod', last_name: 'Bahodirov' }
    }
];

// List of Students with Correct Names
export let MOCK_STUDENTS_LIST = [
    {
        id: 's1',
        student_id: '1001',
        first_name: 'Jahongir',
        surname: "Po'latov",
        age: 16,
        sex: 'male',
        groups: [
            { id: 'g1', name: 'Math 101', price: 500000, teacher_name: 'Mr. Smith', joined_at: '2023-09-01' }
        ],
        payment_status: 'paid',
        emoji: '👨‍🎓'
    },
    {
        id: 's2',
        student_id: '1002',
        first_name: 'Shahzod',
        surname: 'Bahodirov',
        age: 15,
        sex: 'male',
        groups: [
            { id: 'g2', name: 'Physics 101', price: 450000, teacher_name: 'Mrs. Johnson', joined_at: '2023-09-05' }
        ],
        payment_status: 'overdue',
        emoji: '👨‍🎓'
    },
    {
        id: 's3',
        student_id: '1003',
        first_name: 'Temurbek',
        surname: 'Adhamov',
        age: 17,
        sex: 'male',
        groups: [],
        payment_status: 'paid',
        emoji: '👨‍🎓'
    },
    {
        id: 's4',
        student_id: '1004',
        first_name: 'Bekzod',
        surname: 'Mirahmedov',
        age: 16,
        sex: 'male',
        groups: [],
        payment_status: 'unpaid',
        emoji: '👨‍🎓'
    },
    {
        id: 's5',
        student_id: '1005',
        first_name: 'Avazbek',
        surname: 'Tulovov',
        age: 15,
        sex: 'male',
        groups: [],
        payment_status: 'paid',
        emoji: '👨‍🎓'
    },
    {
        id: 's6',
        student_id: '1006',
        first_name: 'Xurshid',
        surname: "O'roqov",
        age: 16,
        sex: 'male',
        groups: [],
        payment_status: 'paid',
        emoji: '👨‍🎓'
    },
    {
        id: 's7',
        student_id: '1007',
        first_name: 'Azam',
        surname: 'Qahramoniy',
        age: 16,
        sex: 'male',
        groups: [],
        payment_status: 'paid',
        emoji: '👨‍🎓'
    }
];


// --- Service Functions ---

export const mockService = {
    login: async (_user: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    },

    getStudentDashboard: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_DASHBOARD_DATA.student;
    },

    getStudentExams: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_STUDENT_EXAMS;
    },

    getTeacherData: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_TEACHER_DATA;
    },

    getAdminData: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_ADMIN_DATA;
    },

    getJourneyData: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_JOURNEY_DATA;
    },

    getStudentSettings: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            support_info: {
                phone: '+998 90 123 45 67',
                telegram: '@support_bot',
                faq: [
                    { question: 'How to pay?', answer: 'You can pay via Click or Payme.' },
                    { question: 'How to contact teacher?', answer: 'Use the group chat.' }
                ]
            }
        };
    },

    createExam: async (examData: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // STATEFUL UPDATE
        const newExam = {
            id: `exam_${Date.now()}`,
            title: examData.title,
            description: examData.description || '',
            duration_minutes: examData.duration_minutes || 60,
            type: examData.type,
            questions: [{ count: 0 }],
            exam_assignments: [{ count: 0 }],
            created_at: new Date().toISOString()
        };
        MOCK_TEACHER_EXAMS.push(newExam);
        return { success: true, examId: newExam.id };
    },

    saveAttendance: async (_data: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    },

    updateCurriculum: async (_data: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    },

    scheduleClass: async (_data: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    },

    getTeacherExams: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_TEACHER_EXAMS;
    },

    getTeacherPayments: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_TEACHER_PAYMENTS;
    },

    updateTeacherSettings: async (_data: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
    },

    getExamWithQuestions: async (examId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            id: examId,
            title: 'Mock Exam Title',
            description: 'This is a mock exam description.',
            duration_minutes: 60,
            type: 'online',
            location: 'Room 101',
            questions: [
                { id: 'q1', text: 'What is 2+2?', type: 'multiple_choice', points: 5, correct_answer: '4', options: ['3', '4', '5'] },
                { id: 'q2', text: 'Explain gravity.', type: 'text', points: 10, correct_answer: '' }
            ]
        };
    },

    getExamSubmissions: async (_examId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_EXAM_SUBMISSIONS;
    },

    saveExamGrade: async (_submissionId: string, _score: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // STATEFUL UPDATE (Mock)
        const sub = MOCK_EXAM_SUBMISSIONS.find(s => s.id === _submissionId);
        if (sub) {
            sub.score = _score;
        }
        return { success: true };
    },

    getGroups: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'g1', name: 'Mathematics 101' },
            { id: 'g2', name: 'Physics 202' },
            { id: 'g3', name: 'English Literature' }
        ];
    },

    saveExam: async (examData: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, id: examData.id || 'new_exam_id' };
    },

    uploadFile: async (file: File) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { publicUrl: URL.createObjectURL(file) };
    },

    generateAIQuestions: async (_fileUrl: string) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            questions: [
                {
                    text: 'Generated Question 1 from PDF',
                    type: 'multiple_choice',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct_answer: 'Option A',
                    points: 5
                },
                {
                    text: 'Generated Question 2 from PDF',
                    type: 'boolean',
                    options: ['True', 'False'],
                    correct_answer: 'True',
                    points: 5
                }
            ]
        };
    },

    getGroupStudents: async (_groupId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        // Return subset of correct students
        return MOCK_STUDENTS_LIST.slice(0, 5).map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.surname}`,
            attendance: '95%',
            performance: 'A',
            emoji: s.emoji
        }));
    },

    getTeacherDetails: async (teacherId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            teacher: {
                id: teacherId,
                first_name: 'Sarah',
                surname: 'Teacher',
                phone_number: '+1234567890',
                bio: 'Mathematics Teacher with 10 years of experience.',
                username: 'sarah_teacher',
                telegram_id: 123456789,
                emoji: '👩‍🏫'
            },
            groups: [
                {
                    id: 'g1',
                    name: 'Mathematics 101',
                    price: 500000,
                    schedule: {},
                    student_count: 15
                },
                {
                    id: 'g2',
                    name: 'Advanced Algebra',
                    price: 600000,
                    schedule: {},
                    student_count: 10
                }
            ]
        };
    },

    deleteTeacherPayment: async (_teacherId: string, _paymentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
    },

    addTeacherPayment: async (_teacherId: string, payment: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newPayment = {
            id: Date.now().toString(),
            ...payment
        };
        MOCK_TEACHER_PAYMENTS.unshift(newPayment);
        return newPayment;
    },

    getAdminStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_ADMIN_DATA.stats;
    },

    getAdminStudents: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_STUDENTS_LIST;
    },

    getAdminStudentDetails: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const student = MOCK_STUDENTS_LIST.find(s => s.id === id) || MOCK_STUDENTS_LIST[0];
        return {
            ...student,
            phone_number: '+998901234567',
            username: student.first_name.toLowerCase(),
            groups: [
                {
                    id: 'g1',
                    name: 'Math 101',
                    price: 500000,
                    teacher: { first_name: 'Mr.', surname: 'Smith' },
                    payment_status: 'paid',
                    schedule: { 'monday': ['10:00'], 'wednesday': ['10:00'] }
                }
            ]
        };
    },

    getStudentAttendance: async (_studentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'a1', date: new Date().toISOString(), status: 'present' },
            { id: 'a2', date: new Date(Date.now() - 86400000).toISOString(), status: 'absent' }
        ];
    },

    getAdminGroups: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'g1', name: 'Math 101', teacher_id: 't1', subject_id: 'sub1', schedule: 'Mon, Wed 10:00' },
            { id: 'g2', name: 'Physics 101', teacher_id: 't2', subject_id: 'sub2', schedule: 'Tue, Thu 14:00' }
        ];
    },

    getAdminTeachers: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 't1', first_name: 'Sarah', surname: 'Teacher', role: 'teacher', subjects: ['Math'], groups_count: 3, emoji: '👩‍🏫' },
            { id: 't2', first_name: 'Albert', surname: 'Einstein', role: 'teacher', subjects: ['Physics'], groups_count: 2, emoji: '👨‍🔬' }
        ];
    },

    getSubjects: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'sub1', name: 'Mathematics' },
            { id: 'sub2', name: 'Physics' },
            { id: 'sub3', name: 'English' }
        ];
    },

    createGroup: async (group: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock create group:', group);
        return { success: true };
    },

    updateGroup: async (id: string, group: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock update group:', id, group);
        return { success: true };
    },

    deleteGroup: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock delete group:', id);
        return { success: true };
    },

    getStudentPayments: async (_studentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'p1', amount: 500000, payment_date: '2023-10-01', payment_method: 'cash', subject_name: 'Math 101', group_id: 'g1' },
            { id: 'p2', amount: 450000, payment_date: '2023-09-01', payment_method: 'card', subject_name: 'Physics 101', group_id: 'g2' }
        ];
    },

    deleteStudentPayment: async (studentId: string, paymentId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock delete student payment:', studentId, paymentId);
        return { success: true };
    },

    addStudentPayment: async (studentId: string, payment: any) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock add student payment:', studentId, payment);
        return { success: true };
    },

    updateStudentGroups: async (studentId: string, data: { groupId: string, action: 'add' | 'remove' | 'update_date', joinedAt?: string }) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock update student groups:', studentId, data);
        return { success: true };
    }
};

const MOCK_TEACHER_EXAMS = [
    {
        id: 'exam_t1',
        title: 'Midterm English',
        description: 'Midterm examination covering all topics from the first half of the semester.',
        duration_minutes: 60,
        type: 'online',
        questions: [{ count: 20 }],
        exam_assignments: [{ count: 12 }],
        created_at: '2023-11-25T10:00:00'
    },
    {
        id: 'exam_t2',
        title: 'Physics Quiz',
        description: 'Quick quiz on Newton\'s laws.',
        duration_minutes: 30,
        type: 'offline',
        questions: [{ count: 10 }],
        exam_assignments: [{ count: 8 }],
        created_at: '2023-12-01T14:00:00'
    }
];

const MOCK_TEACHER_PAYMENTS = [
    { id: 'tp1', amount: 5000000, payment_date: '2023-11-30', description: 'Salary for November', status: 'paid' },
    { id: 'tp2', amount: 5000000, payment_date: '2023-10-31', description: 'Salary for October', status: 'paid' },
    { id: 'tp3', amount: 5000000, payment_date: '2023-09-30', description: 'Salary for September', status: 'paid' }
];

const MOCK_EXAM_SUBMISSIONS = [
    {
        id: 'sub_1',
        submitted_at: '2023-12-05T10:30:00',
        score: 0,
        answers: { 'q1': '4', 'q2': 'Gravity is a force.' },
        student: { first_name: 'Alex', last_name: 'Student' }
    },
    {
        id: 'sub_2',
        submitted_at: '2023-12-05T10:35:00',
        score: 0,
        answers: { 'q1': '3', 'q2': 'I dont know.' },
        student: { first_name: 'John', last_name: 'Doe' }
    }
];
