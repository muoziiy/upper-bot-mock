import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { Card } from '../ui/Card';

interface SubjectStatsProps {
    subjectColor?: string;
    stats: {
        attendancePercentage: number;
        averageScore: number;
        lessonsCompleted: number;
        totalLessons: number;
    };
}

const SubjectStats: React.FC<SubjectStatsProps> = ({ subjectColor = '#3390EC', stats }) => {
    const statItems = [
        {
            label: 'Attendance',
            value: `${stats.attendancePercentage}%`,
            icon: Calendar,
            description: 'Present in class',
            color: stats.attendancePercentage >= 80 ? '#10b981' : stats.attendancePercentage >= 60 ? '#f59e0b' : '#ef4444'
        },
        {
            label: 'Avg. Score',
            value: `${stats.averageScore}%`,
            icon: TrendingUp,
            description: 'Overall performance',
            color: stats.averageScore >= 80 ? '#10b981' : stats.averageScore >= 60 ? '#f59e0b' : '#ef4444'
        },
        {
            label: 'Progress',
            value: `${Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)}%`,
            icon: Target,
            description: `${stats.lessonsCompleted}/${stats.totalLessons} lessons`,
            color: subjectColor
        },
        {
            label: 'Rank',
            value: '#12',
            icon: Award,
            description: 'In your class',
            color: '#fbbf24'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
        >
            {statItems.map((item) => {
                const Icon = item.icon;

                return (
                    <motion.div
                        key={item.label}
                        variants={itemVariants}
                    >
                        <Card className="p-4 relative overflow-hidden">
                            {/* Background decoration */}
                            <div
                                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10"
                                style={{ backgroundColor: item.color }}
                            />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ backgroundColor: `${item.color}15` }}
                                >
                                    <Icon size={20} style={{ color: item.color }} />
                                </div>

                                {/* Value */}
                                <div className="text-2xl font-bold text-tg-text mb-1">
                                    {item.value}
                                </div>

                                {/* Label */}
                                <div className="text-xs font-medium text-tg-text mb-1">
                                    {item.label}
                                </div>

                                {/* Description */}
                                <div className="text-[10px] text-tg-hint">
                                    {item.description}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default SubjectStats;
