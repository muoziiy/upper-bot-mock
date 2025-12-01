import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';

interface StudentExam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    type: 'online' | 'offline';
    questions: { count: number }[];
    scheduled_date: string;
    student_status: 'pending' | 'in_progress' | 'submitted' | 'graded';
    score?: number;
}

const StudentExams: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, webApp } = useTelegram();
    const [exams, setExams] = useState<StudentExam[]>([]);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/exams/student/list`, {
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

    const upcomingExams = exams.filter(e => e.student_status === 'pending' || e.student_status === 'in_progress');
    const pastExams = exams.filter(e => e.student_status === 'submitted' || e.student_status === 'graded');

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-4 text-black dark:text-white">
            <header className="mb-6 px-4">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t('student.exams', 'Exams')}
                </h1>
            </header>

            {exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <span className="text-4xl mb-4">🎉</span>
                    <h3 className="text-xl font-semibold mb-2">{t('student.no_exams', 'No Exams Assigned')}</h3>
                    <p className="text-gray-500 mb-6">{t('student.enjoy_free_time', 'You have no upcoming exams.')}</p>
                </div>
            ) : (
                <>
                    {upcomingExams.length > 0 && (
                        <AdminSection title={t('student.upcoming_exams', 'Upcoming')}>
                            {upcomingExams.map((exam, index) => (
                                <AdminListItem
                                    key={exam.id}
                                    title={exam.title}
                                    subtitle={`${new Date(exam.scheduled_date).toLocaleDateString()} • ${exam.duration_minutes} min`}
                                    icon="📝"
                                    iconColor="bg-blue-500"
                                    onClick={() => navigate(`/student/exams/${exam.id}/take`)}
                                    showChevron
                                    isLast={index === upcomingExams.length - 1}
                                />
                            ))}
                        </AdminSection>
                    )}

                    {pastExams.length > 0 && (
                        <AdminSection title={t('student.past_exams', 'Past Exams')}>
                            {pastExams.map((exam, index) => (
                                <AdminListItem
                                    key={exam.id}
                                    title={exam.title}
                                    subtitle={`Score: ${exam.score !== undefined ? exam.score.toFixed(0) + '%' : 'Pending'}`}
                                    icon="✅"
                                    iconColor="bg-green-500"
                                    onClick={() => { }} // Maybe show results later
                                    isLast={index === pastExams.length - 1}
                                />
                            ))}
                        </AdminSection>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentExams;
