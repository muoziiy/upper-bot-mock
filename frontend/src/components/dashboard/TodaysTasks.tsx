import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Clock } from 'lucide-react';
import ExamInfoModal from './ExamInfoModal';

interface Exam {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

interface TodaysTasksProps {
    upcomingExams: Exam[];
}

const TodaysTasks: React.FC<TodaysTasksProps> = ({ upcomingExams }) => {
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (upcomingExams.length === 0) {
        return (
            <Card className="p-6 text-center">
                <p className="text-tg-hint">No upcoming exams. Take a break! 🎉</p>
            </Card>
        );
    }

    return (
        <div className="space-y-2">
            <ExamInfoModal exam={selectedExam} onClose={() => setSelectedExam(null)} />

            {upcomingExams.map((exam) => (
                <Card key={exam.id} className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold">{exam.title}</h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-tg-hint">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(exam.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(exam.start_time)}
                            </span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="ml-4 shrink-0"
                        onClick={() => setSelectedExam(exam)}
                    >
                        More Info
                    </Button>
                </Card>
            ))}
        </div>
    );
};

export default TodaysTasks;

