import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import duckSuccess from '../assets/animations/duck_success.json';

interface Question {
    id: string;
    text: string;
    type: 'multiple_choice' | 'text' | 'boolean';
    options?: string[];
    points: number;
    media_url?: string;
    media_type?: 'image' | 'audio';
}

interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    questions: Question[];
}

const TakeExam: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, webApp } = useTelegram();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        fetchExam();
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => navigate(-1));
        return () => {
            webApp.BackButton.offClick(() => navigate(-1));
        };
    }, [id]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchExam = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/exams/${id}/take`, {
                headers: {
                    'x-user-id': user?.id?.toString() || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setExam(data);
                setTimeLeft(data.duration_minutes * 60);
            }
        } catch (error) {
            console.error('Failed to fetch exam', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!exam) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/exams/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id?.toString() || ''
                },
                body: JSON.stringify({ answers })
            });

            if (response.ok) {
                const data = await response.json();
                setScore(data.score);
                setShowSuccess(true);
                webApp.HapticFeedback.notificationOccurred('success');
            }
        } catch (error) {
            console.error('Failed to submit exam', error);
            webApp.HapticFeedback.notificationOccurred('error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !exam) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">Loading...</div>;
    }

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white p-4">
                <div className="w-64 h-64">
                    <Lottie animationData={duckSuccess} loop={false} />
                </div>
                <h2 className="text-2xl font-bold mt-4">{t('exam.submitted', 'Exam Submitted!')}</h2>
                <p className="text-lg mt-2 text-gray-500">
                    {t('exam.score', 'Your Score')}: <span className="font-bold text-blue-500">{score?.toFixed(0)}%</span>
                </p>
                <button
                    onClick={() => navigate('/student/exams')}
                    className="mt-8 bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                    {t('common.back', 'Back to Exams')}
                </button>
            </div>
        );
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 text-black dark:text-white flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-[#1C1C1E] px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="font-semibold truncate max-w-[50%]">{exam.title}</div>
                <div className={`font-mono font-medium ${timeLeft && timeLeft < 300 ? 'text-red-500' : 'text-blue-500'}`}>
                    {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-800">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
                />
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                            Question {currentQuestionIndex + 1} of {exam.questions.length}
                        </span>
                        <h2 className="text-xl font-bold mt-2">{currentQuestion.text}</h2>
                    </div>

                    {currentQuestion.media_url && (
                        <div className="mb-6 rounded-xl overflow-hidden bg-black/5 border border-gray-200 dark:border-gray-800">
                            {currentQuestion.media_type === 'image' ? (
                                <img src={currentQuestion.media_url} alt="Question Media" className="w-full h-auto" />
                            ) : (
                                <audio controls src={currentQuestion.media_url} className="w-full p-4" />
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(currentQuestion.id, option)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentQuestion.id] === option
                                        ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === option ? 'border-white' : 'border-gray-300'
                                        }`}>
                                        {answers[currentQuestion.id] === option && <div className="w-3 h-3 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-lg">{option}</span>
                                </div>
                            </button>
                        ))}

                        {currentQuestion.type === 'boolean' && (
                            <div className="grid grid-cols-2 gap-4">
                                {['True', 'False'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(currentQuestion.id, option)}
                                        className={`p-6 rounded-xl border text-center font-semibold transition-all ${answers[currentQuestion.id] === option
                                                ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                                : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-gray-800'
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
                                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                className="w-full p-4 rounded-xl border bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none h-40"
                                placeholder="Type your answer here..."
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-white dark:bg-[#1C1C1E] p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center max-w-2xl mx-auto w-full">
                <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 rounded-xl font-medium text-gray-500 disabled:opacity-30"
                >
                    Previous
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 rounded-xl font-bold bg-green-500 text-white shadow-lg disabled:opacity-70"
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                        className="px-8 py-3 rounded-xl font-bold bg-blue-500 text-white shadow-lg"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeExam;
