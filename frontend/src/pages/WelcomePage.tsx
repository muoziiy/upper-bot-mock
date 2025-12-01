import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { MOCK_USERS } from '../services/mockData';
import { GraduationCap, Users, ShieldCheck, UserCircle } from 'lucide-react';

import logo from '../assets/logo.png';

const WelcomePage: React.FC = () => {
    const { setUser } = useTelegram();
    const navigate = useNavigate();

    const handleRoleSelect = (role: keyof typeof MOCK_USERS) => {
        const user = MOCK_USERS[role];
        setUser(user);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-tg-secondary p-6 flex flex-col items-center justify-center text-tg-text">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2 flex flex-col items-center">
                    <img src={logo} alt="Logo" className="w-24 h-24 mb-4 object-contain" />
                    <h1 className="text-3xl font-bold tracking-tight">Education Center</h1>
                    <p className="text-tg-hint text-lg">Select a role to explore the demo</p>
                </div>

                <div className="grid gap-4">
                    <button
                        onClick={() => handleRoleSelect('student')}
                        className="group relative flex items-center p-4 bg-tg-bg rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                            <GraduationCap size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Student</h3>
                            <p className="text-sm text-tg-hint">View schedule, exams, and progress</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('teacher')}
                        className="group relative flex items-center p-4 bg-tg-bg rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mr-4">
                            <Users size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Teacher</h3>
                            <p className="text-sm text-tg-hint">Manage groups, attendance, and grading</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('admin')}
                        className="group relative flex items-center p-4 bg-tg-bg rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mr-4">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Admin</h3>
                            <p className="text-sm text-tg-hint">System overview and user management</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('parent')}
                        className="group relative flex items-center p-4 bg-tg-bg rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mr-4">
                            <UserCircle size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Parent</h3>
                            <p className="text-sm text-tg-hint">Monitor child's performance</p>
                        </div>
                    </button>
                </div>

                <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-center text-yellow-800 dark:text-yellow-200">
                        Disclaimer: This is just an example version and can be customized to fit your center.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
