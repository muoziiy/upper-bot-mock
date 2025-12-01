import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';
import { useTelegram } from '../context/TelegramContext';

interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    type: 'online' | 'offline';
    questions: { count: number }[];
    exam_assignments: { count: number }[];
    created_at: string;
}

const TeacherExams: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, webApp } = useTelegram();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();

        // Setup Back Button
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => navigate(-1));

        return () => {
            webApp.BackButton.offClick(() => navigate(-1));
        };
    }, []);

    const fetchExams = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/exams/teacher/list`, {
                headers: {
                    'x-user-id': user?.id?.toString() || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setExams(data);
            }
        } catch (error) {
            console.error('Failed to fetch exams', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-4 text-black dark:text-white">
            <header className="mb-6 px-4">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t('teacher.my_exams', 'My Exams')}
                </h1>
            </header>

            {exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <span className="text-4xl mb-4">📝</span>
                    <h3 className="text-xl font-semibold mb-2">{t('teacher.no_exams', 'No Exams Yet')}</h3>
                    <p className="text-gray-500 mb-6">{t('teacher.create_first_exam', 'Create your first exam to get started.')}</p>
                </div>
            ) : (
                <AdminSection title={t('teacher.all_exams', 'All Exams')}>
                    {exams.map((exam, index) => (
                        <AdminListItem
                            key={exam.id}
                            title={exam.title}
                            subtitle={`${exam.type === 'online' ? 'Online' : 'Offline'} • ${exam.duration_minutes} min • ${exam.questions?.[0]?.count || 0} Qs`}
                            icon="📝"
                            iconColor="bg-blue-500"
                            onClick={() => navigate(`/teacher/exams/${exam.id}`)} // We'll need to handle this route
                            showChevron
                            isLast={index === exams.length - 1}
                        />
                    ))}
                </AdminSection>
            )}
        </div>
    );
};

export default TeacherExams;
