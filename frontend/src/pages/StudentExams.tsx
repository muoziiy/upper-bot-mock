import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExamAssignment {
    id: string;
    status: string;
    scheduled_date: string;
    exam: {
        id: string;
        title: string;
        description: string;
        duration_minutes: number;
        type: 'online' | 'offline';
        location?: string;
        questions: { count: number }[];
    };
}

const StudentExams: React.FC = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // 1. Get user's group
            const { data: memberData } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id)
                .single();

            if (!memberData) {
                setLoading(false);
                return;
            }

            // 2. Get assignments for that group
            const { data, error } = await supabase
                .from('exam_assignments')
                .select(`
          id,
          status,
          scheduled_date,
          exam:exams (
            id,
            title,
            description,
            duration_minutes,
            type,
            location,
            questions (count)
          )
        `)
                .eq('group_id', memberData.group_id)
                .order('scheduled_date', { ascending: true });

            if (error) throw error;
            // Cast data to any to avoid strict type mismatch with nested joins
            setAssignments((data as any) || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();
    const upcomingExams = assignments.filter(a => new Date(a.scheduled_date) > now && a.status !== 'completed');
    const pastExams = assignments.filter(a => new Date(a.scheduled_date) <= now || a.status === 'completed');

    const displayedExams = activeTab === 'upcoming' ? upcomingExams : pastExams;

    return (
        <div className="p-4 max-w-lg mx-auto pb-24 font-sans">
            <h1 className="text-2xl font-bold mb-6">📚 My Exams</h1>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming'
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                            : 'text-gray-500'
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                            : 'text-gray-500'
                        }`}
                >
                    History
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading exams...</div>
            ) : (
                <div className="space-y-4">
                    {displayedExams.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No {activeTab} exams found.</p>
                        </div>
                    ) : (
                        displayedExams.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 ${assignment.exam.type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {assignment.exam.type === 'online' ? '📝 Online' : '🏫 Offline'}
                                        </span>
                                        <h3 className="font-bold text-lg">{assignment.exam.title}</h3>
                                    </div>
                                    <div className="text-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg min-w-[60px]">
                                        <div className="text-xs text-gray-500 uppercase">
                                            {new Date(assignment.scheduled_date).toLocaleString('default', { month: 'short' })}
                                        </div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {new Date(assignment.scheduled_date).getDate()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        {new Date(assignment.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-gray-300">|</span>
                                        {assignment.exam.duration_minutes} min
                                    </div>
                                    {assignment.exam.type === 'offline' && (
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <MapPin size={16} />
                                            {assignment.exam.location}
                                        </div>
                                    )}
                                </div>

                                {assignment.exam.type === 'online' && activeTab === 'upcoming' && (
                                    <button
                                        onClick={() => navigate(`/student/exams/${assignment.exam.id}/take`)}
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Exam <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentExams;
