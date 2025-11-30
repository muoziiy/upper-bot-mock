import React, { useState, useEffect } from 'react';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { Plus } from 'lucide-react';

const AdminSubjects: React.FC = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

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

    const handleAddSubject = async () => {
        if (!newSubject.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSubject })
            });

            if (res.ok) {
                setNewSubject('');
                fetchSubjects();
            } else {
                alert('Failed to add subject');
            }
        } catch (e) {
            console.error('Error adding subject', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Manage Subjects</h1>

            <div className="px-4 mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="New Subject Name"
                        className="flex-1 bg-[#E3E3E8] dark:bg-[#1C1C1E] text-black dark:text-white border-none rounded-[10px] p-3 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-[#8E8E93]"
                    />
                    <button
                        onClick={handleAddSubject}
                        disabled={loading || !newSubject.trim()}
                        className="bg-pink-500 text-white p-3 rounded-[10px] flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-pink-500/20"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <AdminSection title="Existing Subjects">
                {subjects.map((subject, index) => (
                    <AdminListItem
                        key={subject.id}
                        title={subject.name}
                        icon="📚"
                        iconColor="bg-pink-500"
                        isLast={index === subjects.length - 1}
                    />
                ))}
                {subjects.length === 0 && (
                    <div className="p-4 text-center text-[#8E8E93]">No subjects found.</div>
                )}
            </AdminSection>
        </div>
    );
};

export default AdminSubjects;
