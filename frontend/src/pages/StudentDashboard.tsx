import React, { useEffect, useState } from 'react';
import { useTelegram } from '../context/TelegramContext';

const StudentDashboard: React.FC = () => {
    const { user } = useTelegram();
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        // Fetch exams
        const fetchExams = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/students/exams`, {
                        headers: { 'x-user-id': user.id.toString() }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setExams(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch exams", e);
                }
            }
        };
        fetchExams();
    }, [user]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-tg-text">Student Dashboard</h1>
            <p className="text-tg-hint mb-4">Welcome, {user?.first_name}!</p>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-tg-text">Available Exams</h2>
                {exams.length === 0 ? (
                    <p className="text-tg-hint">No exams available.</p>
                ) : (
                    exams.map((exam: any) => (
                        <div key={exam.id} className="bg-tg-secondary p-4 rounded-lg shadow">
                            <h3 className="font-bold text-tg-text">{exam.title}</h3>
                            <p className="text-tg-hint">{exam.description}</p>
                            <button className="mt-2 bg-tg-button text-tg-button-text px-4 py-2 rounded">
                                Start Exam
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
