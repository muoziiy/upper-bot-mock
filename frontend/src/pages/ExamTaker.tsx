import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Question {
    id: string;
    text: string;
    type: 'multiple_choice' | 'text' | 'boolean';
    options?: string[];
    media_url?: string;
    media_type?: 'image' | 'audio';
    points: number;
}

interface Exam {
    id: string;
    title: string;
    duration_minutes: number;
    questions: Question[];
}

const ExamTaker: React.FC = () => {
    const navigate = useNavigate();
    const { examId } = useParams();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchExam();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [examId]);

    const fetchExam = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*, questions(*)')
                .eq('id', examId)
                .single();

            if (error) throw error;
            setExam(data);
            setTimeLeft(data.duration_minutes * 60);

            // Start Timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleSubmit(true); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error fetching exam:', error);
            alert('Failed to load exam');
            navigate('/student/exams');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (value: any) => {
        if (!exam) return;
        const questionId = exam.questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (auto = false) => {
        if (submitting) return;
        if (!auto && !window.confirm('Are you sure you want to submit?')) return;

        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const user = (await supabase.auth.getUser()).data.user;

            const { error } = await supabase
                .from('exam_results')
                .insert([{
                    exam_id: examId,
                    student_id: user?.id,
                    answers: answers,
                    submitted_at: new Date().toISOString(),
                    score: 0 // Placeholder, backend should calculate
                }]);

            if (error) throw error;

            alert(auto ? 'Time is up! Exam submitted.' : 'Exam submitted successfully!');
            navigate('/student/exams');
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit exam. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading || !exam) {
        return <div className="flex h-screen items-center justify-center">Loading Exam...</div>;
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="font-bold text-lg truncate max-w-[200px]">{exam.title}</h1>
                    <div className="text-xs text-gray-500">
                        Question {currentQuestionIndex + 1} of {exam.questions.length}
                    </div>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 p-4 max-w-2xl mx-auto w-full overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">

                    <div className="flex-1">
                        <h2 className="text-xl font-medium mb-6 leading-relaxed">{currentQuestion.text}</h2>

                        {currentQuestion.media_url && (
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                                {currentQuestion.media_type === 'image' ? (
                                    <img src={currentQuestion.media_url} alt="Question Media" className="w-full h-auto max-h-64 object-contain" />
                                ) : (
                                    <div className="p-4 flex justify-center">
                                        <audio controls src={currentQuestion.media_url} className="w-full" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion.id] === option
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === option ? 'border-blue-500' : 'border-gray-300'
                                            }`}>
                                            {answers[currentQuestion.id] === option && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                                        </div>
                                        {option}
                                    </div>
                                </button>
                            ))}

                            {currentQuestion.type === 'boolean' && (
                                <div className="flex gap-4">
                                    {['True', 'False'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(option)}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all text-center font-medium ${answers[currentQuestion.id] === option
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                                                    : 'border-gray-100 dark:border-gray-700'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'text' && (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none min-h-[150px]"
                                    placeholder="Type your answer here..."
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex gap-1">
                        {exam.questions.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${idx === currentQuestionIndex ? 'bg-blue-500' :
                                        answers[exam.questions[idx].id] ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {isLastQuestion ? (
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-600 transition-all flex items-center gap-2"
                        >
                            {submitting ? 'Submitting...' : 'Submit Exam'}
                            <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamTaker;
