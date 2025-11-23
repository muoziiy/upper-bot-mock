import React from 'react';
import { useTelegram } from '../context/TelegramContext';

const TeacherDashboard: React.FC = () => {
    const { user } = useTelegram();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-tg-text">Teacher Dashboard</h1>
            <p className="text-tg-hint mb-4">Welcome, {user?.first_name}!</p>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-tg-secondary p-4 rounded-lg border border-white/5">
                    <h2 className="font-bold text-tg-text">My Groups</h2>
                    <p className="text-tg-hint">Manage your student groups.</p>
                    <button className="mt-2 bg-tg-button text-tg-button-text px-4 py-2 rounded">
                        View Groups
                    </button>
                </div>

                <div className="bg-tg-secondary p-4 rounded-lg border border-white/5">
                    <h2 className="font-bold text-tg-text">Create Exam</h2>
                    <p className="text-tg-hint">Create new exams for your groups.</p>
                    <button className="mt-2 bg-tg-button text-tg-button-text px-4 py-2 rounded">
                        New Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
