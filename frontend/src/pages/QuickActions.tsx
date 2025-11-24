import React from 'react';

import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import {
    Plus,
    FileText,
    Users,
    Settings,
    Bell,
    Calendar,
    CheckSquare,
    BookOpen
} from 'lucide-react';

const QuickActions: React.FC = () => {
    // const { user } = useTelegram(); // user is unused
    const { dashboardData } = useAppData();
    const role = dashboardData?.user.role || 'student';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const teacherActions = [
        { id: 'create_exam', label: 'Create Exam', icon: Plus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'curriculum', label: 'Edit Curriculum', icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'schedule', label: 'Schedule Class', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    const adminActions = [
        { id: 'add_user', label: 'Add User', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'broadcast', label: 'Broadcast', icon: Bell, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-500/10' },
        { id: 'reports', label: 'View Reports', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    const actions = role === 'admin' || role === 'super_admin' ? adminActions : teacherActions;

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text px-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Quick Actions</h1>
                    <p className="text-tg-hint">Manage your tasks efficiently</p>
                </header>

                <div className="grid grid-cols-2 gap-4">
                    {actions.map((action) => (
                        <motion.button
                            key={action.id}
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            className="bg-tg-bg p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3 border border-tg-secondary/50 aspect-square"
                        >
                            <div className={`p-3 rounded-full ${action.bg}`}>
                                <action.icon className={`w-6 h-6 ${action.color}`} />
                            </div>
                            <span className="text-sm font-medium text-center">{action.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Recent Activity Section (Mock) */}
                <div className="mt-8">
                    <h2 className="text-sm font-medium text-tg-hint uppercase mb-3 px-1">Recent Activity</h2>
                    <div className="space-y-3">
                        <motion.div variants={itemVariants} className="bg-tg-bg p-4 rounded-xl shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <div>
                                <p className="text-sm font-medium">Exam "Math Midterm" created</p>
                                <p className="text-xs text-tg-hint">2 hours ago</p>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-tg-bg p-4 rounded-xl shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Attendance marked for Group A</p>
                                <p className="text-xs text-tg-hint">Yesterday, 14:30</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default QuickActions;
