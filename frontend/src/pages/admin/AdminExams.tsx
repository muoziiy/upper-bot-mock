import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    created_at: string;
    is_published: boolean;
    type: 'online' | 'offline';
    location?: string;
    questions: any[];
}

const AdminExams: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'passed'>('upcoming');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*, questions(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExams(data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mock logic for tabs (since we don't have schedule dates in exams table yet, just showing all)
    // In real implementation, we would filter by exam_assignments date
    const displayedExams = filteredExams;

    return (
        <div className="p-4 max-w-2xl mx-auto pb-24 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">📝 {t('exams.title', 'Exams')}</h1>
                <button
                    onClick={() => navigate('/admin/exams/new')}
                    className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl flex items-center gap-2 mb-6">
                <span className="text-xl">🔍</span>
                <input
                    type="text"
                    placeholder={t('common.search', 'Search...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-base"
                />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 mb-6">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'upcoming'
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    📅 Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('passed')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'passed'
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    ✅ Passed
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
                <div className="space-y-3">
                    {displayedExams.map((exam) => (
                        <div
                            key={exam.id}
                            onClick={() => navigate(`/admin/exams/${exam.id}`)}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl active:scale-[0.98] transition-transform cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                                    {exam.type === 'offline' ? '🏫' : '📝'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">{exam.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{exam.type === 'offline' ? 'Offline' : 'Online'}</span>
                                        <span>•</span>
                                        <span>{exam.duration_minutes} min</span>
                                        {exam.questions?.[0]?.count > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{exam.questions[0].count} Qs</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    ›
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminExams;
