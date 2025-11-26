import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useAppData } from '../context/AppDataContext';
import { User, GraduationCap, Users, ChevronRight, Copy, Check } from 'lucide-react';

const Onboarding: React.FC = () => {
    const { user, webApp } = useTelegram();
    const { refreshData } = useAppData();
    const navigate = useNavigate();
    const [step, setStep] = useState<'selection' | 'student_form' | 'staff_form' | 'existing_info'>('selection');
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.first_name || '',
        surname: user?.last_name || '',
        age: '',
        sex: 'male',
        phoneNumber: '',
        bio: '',
        selectedSubjects: [] as string[]
    });

    // Handle Native Back Button
    useEffect(() => {
        if (step !== 'selection') {
            webApp?.BackButton.show();
            const handleBack = () => setStep('selection');
            webApp?.BackButton.onClick(handleBack);
            return () => {
                webApp?.BackButton.offClick(handleBack);
                webApp?.BackButton.hide();
            };
        } else {
            webApp?.BackButton.hide();
        }
    }, [step, webApp]);

    useEffect(() => {
        if (step === 'staff_form') {
            fetchSubjects();
        }
    }, [step]);

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/subjects`);
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (e) {
            console.error('Failed to fetch subjects', e);
        }
    };

    const handleSubmit = async (type: 'student' | 'staff' | 'existing') => {
        setLoading(true);
        try {
            const endpoint = type === 'existing' ? '/onboarding/existing' : `/onboarding/${type}`;
            const body = {
                userId: user?.id,
                ...formData,
                subjects: formData.selectedSubjects // Only for staff
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                await refreshData(); // Refresh to get new role
                if (type === 'student') {
                    navigate('/guest');
                } else if (type === 'existing') {
                    window.location.reload(); // Full reload as requested
                } else {
                    // Staff or others might go to waiting page
                    navigate('/waiting');
                }
            } else {
                // Log detailed error to console (visible to developers only)
                console.error('[Onboarding Error]', {
                    endpoint,
                    status: res.status,
                    error: data,
                    timestamp: new Date().toISOString()
                });

                // Show user-friendly message
                webApp?.showAlert('Registration failed. Please check all fields and try again.');
            }
        } catch (e) {
            // Log detailed error to console (visible to developers only)
            console.error('[Onboarding Error]', {
                error: e,
                timestamp: new Date().toISOString()
            });

            // Show user-friendly message
            webApp?.showAlert('An error occurred. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleCopyId = () => {
        if (user?.id) {
            navigator.clipboard.writeText(user.id.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isFormValid = (type: 'student' | 'staff') => {
        const { name, surname, age, phoneNumber, selectedSubjects } = formData;

        // Common required fields
        if (!name.trim() || !surname.trim() || !age.trim()) {
            return false;
        }

        // Student-specific validation
        if (type === 'student' && !phoneNumber.trim()) {
            return false;
        }

        // Staff-specific validation (at least one subject required)
        if (type === 'staff' && selectedSubjects.length === 0) {
            return false;
        }

        return true;
    };


    const renderSelection = () => (
        <div className="space-y-4 px-4 pt-8">
            <h1 className="text-2xl font-bold text-center mb-8 text-tg-text">Welcome to Education Center</h1>

            <button
                onClick={() => setStep('student_form')}
                className="w-full bg-tg-bg p-4 rounded-xl flex items-center justify-between shadow-sm hover:bg-tg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                        <User size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-tg-text">New Student</h3>
                        <p className="text-sm text-tg-hint">I want to start learning</p>
                    </div>
                </div>
                <ChevronRight className="text-tg-hint" />
            </button>

            <button
                onClick={() => setStep('existing_info')}
                className="w-full bg-tg-bg p-4 rounded-xl flex items-center justify-between shadow-sm hover:bg-tg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-full text-green-500">
                        <Users size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-tg-text">Existing Student</h3>
                        <p className="text-sm text-tg-hint">I already have an account</p>
                    </div>
                </div>
                <ChevronRight className="text-tg-hint" />
            </button>

            <button
                onClick={() => setStep('staff_form')}
                className="w-full bg-tg-bg p-4 rounded-xl flex items-center justify-between shadow-sm hover:bg-tg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-full text-purple-500">
                        <GraduationCap size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-tg-text">Staff</h3>
                        <p className="text-sm text-tg-hint">I am a teacher or admin</p>
                    </div>
                </div>
                <ChevronRight className="text-tg-hint" />
            </button>
        </div>
    );

    const renderForm = (type: 'student' | 'staff') => (
        <div className="px-4 pt-4 pb-20">
            <h2 className="text-xl font-bold mb-6 text-tg-text">
                {type === 'student' ? 'Student Registration' : 'Staff Registration'}
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-tg-hint mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text focus:border-tg-button outline-none"
                        placeholder="Enter your name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-tg-hint mb-1">Surname <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={formData.surname}
                        onChange={e => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text focus:border-tg-button outline-none"
                        placeholder="Enter your surname"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-tg-hint mb-1">Age <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                            className="w-full bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text focus:border-tg-button outline-none"
                            placeholder="Age"
                            required
                            min="1"
                            max="150"
                        />
                    </div>
                </div>

                {/* Custom Gender Selection */}
                <div>
                    <label className="block text-sm text-tg-hint mb-2">Sex <span className="text-red-500">*</span></label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, sex: 'male' })}
                            className={`flex-1 py-3 rounded-xl border transition-all ${formData.sex === 'male'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-medium'
                                : 'bg-tg-bg border-tg-hint/20 text-tg-hint'
                                }`}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, sex: 'female' })}
                            className={`flex-1 py-3 rounded-xl border transition-all ${formData.sex === 'female'
                                ? 'bg-pink-500/10 border-pink-500 text-pink-500 font-medium'
                                : 'bg-tg-bg border-tg-hint/20 text-tg-hint'
                                }`}
                        >
                            Female
                        </button>
                    </div>
                </div>

                {type === 'student' && (
                    <div>
                        <label className="block text-sm text-tg-hint mb-1">Phone Number <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text focus:border-tg-button outline-none"
                            placeholder="+998..."
                            required
                        />
                    </div>
                )}

                {type === 'staff' && (
                    <>
                        <div>
                            <label className="block text-sm text-tg-hint mb-1">Subjects <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-2">
                                {subjects.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            const selected = formData.selectedSubjects.includes(sub.id)
                                                ? formData.selectedSubjects.filter(id => id !== sub.id)
                                                : [...formData.selectedSubjects, sub.id];
                                            setFormData({ ...formData, selectedSubjects: selected });
                                        }}
                                        className={`p-2 rounded-lg text-sm border transition-colors ${formData.selectedSubjects.includes(sub.id)
                                            ? 'bg-tg-button text-white border-tg-button'
                                            : 'bg-tg-bg border-tg-hint/20 text-tg-text'
                                            }`}
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-tg-hint mb-1">Bio (Optional)</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text focus:border-tg-button outline-none h-24 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </>
                )}

                <button
                    onClick={() => handleSubmit(type)}
                    disabled={loading || !isFormValid(type)}
                    className="w-full bg-tg-button text-white font-bold py-3 rounded-xl mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
            </div>
        </div>
    );

    const renderExistingInfo = () => (
        <div className="px-4 pt-4 text-center">
            <div className="bg-tg-bg rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold mb-2 text-tg-text">Account Recovery</h2>
                <p className="text-tg-hint mb-6">
                    Please show this ID to an administrator to recover your account access.
                </p>

                <button
                    onClick={handleCopyId}
                    className="bg-tg-secondary p-4 rounded-lg mb-4 w-full flex items-center justify-between active:scale-95 transition-transform"
                >
                    <div className="text-left">
                        <p className="text-xs text-tg-hint uppercase mb-1">Your Telegram ID</p>
                        <p className="text-2xl font-mono font-bold text-tg-text">{user?.id}</p>
                    </div>
                    <div className="text-tg-button">
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                    </div>
                </button>

                <button
                    onClick={() => handleSubmit('existing')}
                    disabled={loading}
                    className="w-full bg-tg-button text-white font-bold py-3 rounded-xl disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'I have notified an Admin'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-tg-secondary">
            {step === 'selection' && renderSelection()}
            {step === 'student_form' && renderForm('student')}
            {step === 'staff_form' && renderForm('staff')}
            {step === 'existing_info' && renderExistingInfo()}
        </div>
    );
};

export default Onboarding;
