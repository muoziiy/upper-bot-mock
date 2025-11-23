import React from 'react';
import { Card } from '../ui/Card';
import { BookOpen, Target, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
    totalTests: number;
    totalQuestions: number;
    averageScore: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
    totalTests,
    totalQuestions,
    averageScore
}) => {
    const stats = [
        {
            icon: BookOpen,
            label: 'Tests Taken',
            value: totalTests,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100',
        },
        {
            icon: Target,
            label: 'Questions',
            value: totalQuestions,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100',
        },
        {
            icon: TrendingUp,
            label: 'Avg Score',
            value: `${averageScore}%`,
            color: 'text-green-500',
            bgColor: 'bg-green-100',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
                <Card key={index} className="p-3">
                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-tg-hint">{stat.label}</p>
                </Card>
            ))}
        </div>
    );
};

export default QuickStats;
