import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, Image as ImageIcon, Mic, Wand2, Calendar, MapPin, Users, FileText, X } from 'lucide-react';
import { mockService } from '../../services/mockData';

interface Question {
    id?: string;
    text: string;
    type: 'multiple_choice' | 'text' | 'boolean';
    options?: string[];
    correct_answer?: string;
    points: number;
    media_url?: string;
    media_type?: 'image' | 'audio';
}

interface Group {
    id: string;
    name: string;
}

const ExamEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id || id === 'new';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [type, setType] = useState<'online' | 'offline'>('online');
    const [location, setLocation] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);

    // Assignment State
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [scheduledDate, setScheduledDate] = useState('');


    const [saving, setSaving] = useState(false);

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiFile, setAiFile] = useState<File | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Question Editor State
    const [tempQuestion, setTempQuestion] = useState<Question>({
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1
    });

    useEffect(() => {
        fetchGroups();
        if (!isNew) {
            fetchExam();
        }
    }, [id]);

    const fetchGroups = async () => {
        const data = await mockService.getGroups();
        setGroups(data || []);
    };

    const fetchExam = async () => {
        try {
            const data = await mockService.getExamWithQuestions(id!);

            if (data) {
                setTitle(data.title);
                setDescription(data.description || '');
                setDuration(data.duration_minutes || 60);
                setType(data.type as any || 'online');
                setLocation(data.location || '');
                setQuestions(data.questions as any || []);
            }
        } catch (error) {
            console.error('Error fetching exam:', error);
        }
    };

    const handleSaveExam = async () => {
        setSaving(true);
        try {
            const examData = {
                id: isNew ? undefined : id,
                title,
                description,
                duration_minutes: duration,
                type,
                location: type === 'offline' ? location : null,
                questions: type === 'online' ? questions : [],
                assignments: selectedGroups.map(groupId => ({
                    group_id: groupId,
                    scheduled_date: scheduledDate
                }))
            };

            await mockService.saveExam(examData);
            navigate('/admin/exams');
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Failed to save exam');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'audio') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await mockService.uploadFile(file);

            setTempQuestion(prev => ({
                ...prev,
                media_url: publicUrl,
                media_type: mediaType
            }));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Upload failed.');
        }
    };

    const handleAiGeneration = async () => {
        if (!aiFile) return;
        setAiLoading(true);

        try {
            // 1. Upload PDF
            const { publicUrl } = await mockService.uploadFile(aiFile);

            // 2. Call Mock AI Service
            const data = await mockService.generateAIQuestions(publicUrl);

            if (data.questions) {
                setQuestions([...questions, ...data.questions as any]);
                setShowAIModal(false);
                setAiFile(null);
            } else {
                alert('Failed to generate questions');
            }

        } catch (error) {
            console.error('AI Generation failed:', error);
            alert('AI Generation failed. Check console.');
        } finally {
            setAiLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, tempQuestion]);
        setTempQuestion({
            text: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 1
        });
    };

    return (
        <div className="p-4 max-w-3xl mx-auto pb-24 font-sans relative">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/exams')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">{isNew ? 'New Exam' : 'Edit Exam'}</h1>
                <div className="ml-auto flex gap-2">
                    {type === 'online' && (
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
                        >
                            <Wand2 size={20} />
                            AI Magic
                        </button>
                    )}
                    <button
                        onClick={handleSaveExam}
                        disabled={saving}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-sm"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Settings */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 space-y-5">

                {/* Type Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setType('online')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'online' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                        📝 Online Exam
                    </button>
                    <button
                        onClick={() => setType('offline')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'offline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                        🏫 Offline Exam
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Final Mathematics Exam"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        rows={3}
                        placeholder="Instructions for students..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Duration (min)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    {type === 'offline' && (
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Location</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full p-3 pl-10 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                    placeholder="e.g. Room 304"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignments Section */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Assign to Groups
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Select Groups</label>
                        <div className="flex flex-wrap gap-2">
                            {groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => {
                                        if (selectedGroups.includes(group.id)) {
                                            setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                        } else {
                                            setSelectedGroups([...selectedGroups, group.id]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedGroups.includes(group.id)
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Schedule Date & Time</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full p-3 pl-10 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Section (Online Only) */}
            {type === 'online' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Questions</h2>

                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 relative">
                            <button
                                onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions.splice(idx, 1);
                                    setQuestions(newQuestions);
                                }}
                                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="font-medium mb-2">
                                <span className="text-gray-500 mr-2">#{idx + 1}</span>
                                {q.text}
                            </div>
                            {q.media_url && (
                                <div className="mb-2">
                                    {q.media_type === 'image' ? (
                                        <img src={q.media_url} alt="Question Media" className="h-32 rounded-lg object-cover" />
                                    ) : (
                                        <audio controls src={q.media_url} />
                                    )}
                                </div>
                            )}
                            <div className="text-sm text-gray-500">
                                {q.type === 'multiple_choice' && (
                                    <ul className="list-disc list-inside pl-4">
                                        {q.options?.map((opt, i) => (
                                            <li key={i} className={opt === q.correct_answer ? 'text-green-600 font-medium' : ''}>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Question Form */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <h3 className="font-medium mb-4">Add Question</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Question Text"
                                value={tempQuestion.text}
                                onChange={(e) => setTempQuestion({ ...tempQuestion, text: e.target.value })}
                                className="w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-600"
                            />

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <ImageIcon size={18} />
                                    <span className="text-sm">Image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <Mic size={18} />
                                    <span className="text-sm">Audio</span>
                                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                                </label>
                            </div>

                            {tempQuestion.media_url && (
                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg inline-block border">
                                    {tempQuestion.media_type === 'image' ? (
                                        <img src={tempQuestion.media_url} alt="Preview" className="h-20 rounded" />
                                    ) : (
                                        <audio controls src={tempQuestion.media_url} />
                                    )}
                                </div>
                            )}

                            <select
                                value={tempQuestion.type}
                                onChange={(e) => setTempQuestion({ ...tempQuestion, type: e.target.value as any })}
                                className="w-full p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-600"
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="text">Text Answer</option>
                                <option value="boolean">True/False</option>
                            </select>

                            {tempQuestion.type === 'multiple_choice' && (
                                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                    {tempQuestion.options?.map((opt, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                name="correct_answer"
                                                checked={tempQuestion.correct_answer === opt && opt !== ''}
                                                onChange={() => setTempQuestion({ ...tempQuestion, correct_answer: opt })}
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOptions = [...(tempQuestion.options || [])];
                                                    newOptions[i] = e.target.value;
                                                    setTempQuestion({ ...tempQuestion, options: newOptions });
                                                }}
                                                placeholder={`Option ${i + 1}`}
                                                className="flex-1 p-2 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addQuestion}
                                disabled={!tempQuestion.text}
                                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wand2 className="text-purple-500" />
                                AI Exam Generator
                            </h3>
                            <button onClick={() => setShowAIModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-sm text-gray-500 mb-4">Upload a PDF to generate questions</p>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>

                            {aiFile && (
                                <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <FileText size={16} />
                                    {aiFile.name}
                                </div>
                            )}

                            <button
                                onClick={handleAiGeneration}
                                disabled={!aiFile || aiLoading}
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {aiLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Analyzing PDF...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={18} />
                                        Generate Questions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamEditor;
