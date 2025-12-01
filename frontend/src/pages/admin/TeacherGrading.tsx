import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Save, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Submission {
    id: string;
    student: {
        first_name: string;
        last_name: string;
    };
    submitted_at: string;
    score: number;
    answers: Record<string, any>;
    status?: 'graded' | 'pending';
}

interface Exam {
    id: string;
    title: string;
    questions: any[];
}

const TeacherGrading: React.FC = () => {
    const navigate = useNavigate();
    const { examId } = useParams();

    const [exam, setExam] = useState<Exam | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(false);

    // Manual scores state: { [questionId]: score }
    const [manualScores, setManualScores] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchData();
    }, [examId]);

    const fetchData = async () => {
        try {
            // Fetch Exam Questions
            const { data: examData, error: examError } = await supabase
                .from('exams')
                .select('*, questions(*)')
                .eq('id', examId)
                .single();

            if (examError) throw examError;
            setExam(examData);

            // Fetch Submissions
            const { data: subData, error: subError } = await supabase
                .from('exam_results')
                .select(`
          id,
          submitted_at,
          score,

    const handleSelectSubmission = (sub: Submission) => {
        setSelectedSubmission(sub);
        // Initialize manual scores with existing auto-calc or 0
        setManualScores({});
    };

    const saveGrade = async () => {
        if (!selectedSubmission || !exam) return;
        setGrading(true);

        try {
            // Calculate total score
            let totalScore = 0;

            exam.questions.forEach(q => {
                // If we manually graded it, use that
                if (manualScores[q.id] !== undefined) {
                    totalScore += manualScores[q.id];
                } else {
                    // Otherwise recalculate auto-score (or keep existing logic)
                    const answer = selectedSubmission.answers[q.id];
                    if (q.type === 'multiple_choice' || q.type === 'boolean') {
                        if (answer === q.correct_answer) {
                            totalScore += q.points;
                        }
                    }
                }
            });

            const { error } = await supabase
                .from('exam_results')
                .update({
                    score: totalScore,
                })
                .eq('id', selectedSubmission.id);

            if (error) throw error;

            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmission.id ? { ...s, score: totalScore } : s
            ));
            setSelectedSubmission(null);
            alert('Grade saved!');

        } catch (error) {
            console.error('Error saving grade:', error);
            alert('Failed to save grade');
        } finally {
            setGrading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4 max-w-6xl mx-auto pb-24 font-sans h-[calc(100vh-80px)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/exams')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Grading: {exam?.title}</h1>
                    <p className="text-gray-500">{submissions.length} Submissions</p>
                </div>
            </div>

            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Sidebar: List of Students */}
                <div className="w-1/3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-y-auto">
                    <div className="p-4 border-b dark:border-gray-800 font-bold text-lg">Students</div>
                    {submissions.map(sub => (
                        <div
                            key={sub.id}
                            onClick={() => handleSelectSubmission(sub)}
                            className={`p - 4 border - b dark: border - gray - 800 cursor - pointer hover: bg - gray - 50 dark: hover: bg - gray - 800 transition - colors ${ selectedSubmission?.id === sub.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            <div className="font-medium">{sub.student?.first_name} {sub.student?.last_name}</div>
                            <div className="flex justify-between mt-1 text-sm text-gray-500">
                                <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                <span className="font-bold text-blue-600">{sub.score} pts</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Area: Grading Interface */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                    {selectedSubmission ? (
                        <>
                            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <h2 className="font-bold text-lg">
                                        {selectedSubmission.student?.first_name}'s Submission
                                    </h2>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <Clock size={14} />
                                        Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={saveGrade}
                                    disabled={grading}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-blue-600 transition-colors"
                                >
                                    <Save size={18} />
                                    Save Grade
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {exam?.questions.map((q, idx) => {
                                    const answer = selectedSubmission.answers[q.id];
                                    const isAutoGraded = q.type === 'multiple_choice' || q.type === 'boolean';
                                    const isCorrect = answer === q.correct_answer;

                                    return (
                                        <div key={q.id} className="border dark:border-gray-700 rounded-xl p-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-gray-500">Question {idx + 1} ({q.points} pts)</span>
                                                {isAutoGraded && (
                                                    <span className={`flex items - center gap - 1 text - sm font - bold ${ isCorrect ? 'text-green-600' : 'text-red-500' } `}>
                                                        {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-lg font-medium mb-4">{q.text}</p>

                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Student Answer</span>
                                                <p className="text-gray-800 dark:text-gray-200">{answer || '(No Answer)'}</p>
                                            </div>

                                            {isAutoGraded ? (
                                                <div className="text-sm text-gray-500">
                                                    Correct Answer: <span className="font-medium text-green-600">{q.correct_answer}</span>
                                                </div>
                                            ) : (
                                                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                                    <label className="block text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2">
                                                        Manual Grade (Max {q.points})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        max={q.points}
                                                        min={0}
                                                        className="w-24 p-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                                                        placeholder="Score"
                                                        value={manualScores[q.id] ?? ''}
                                                        onChange={(e) => setManualScores({
                                                            ...manualScores,
                                                            [q.id]: Number(e.target.value)
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a student to start grading
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherGrading;
