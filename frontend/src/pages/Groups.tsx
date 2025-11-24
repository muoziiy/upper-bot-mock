import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { Users, ChevronRight, Clock } from 'lucide-react';

const Groups: React.FC = () => {
    const { teacherData, loading } = useAppData();

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
    }

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

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text px-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">My Groups</h1>
                    <p className="text-tg-hint">Manage your classes and students</p>
                </header>

                <div className="space-y-4">
                    {teacherData?.groups.map((group) => (
                        <motion.div
                            key={group.id}
                            variants={itemVariants}
                            className="bg-tg-bg p-4 rounded-xl shadow-sm border border-tg-secondary/50"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-tg-text">{group.name}</h3>
                                    <p className="text-xs text-tg-hint">ID: {group.id.toUpperCase()}</p>
                                </div>
                                <span className="bg-tg-button/10 text-tg-button text-xs font-bold px-2 py-1 rounded-md">
                                    Active
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-sm text-tg-hint">
                                    <Users className="w-4 h-4" />
                                    <span>{group.student_count} Students</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-tg-hint">
                                    <Clock className="w-4 h-4" />
                                    <span>{group.next_class}</span>
                                </div>
                            </div>

                            <button className="w-full bg-tg-secondary hover:bg-tg-secondary/80 text-tg-button font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                View Details
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Groups;
