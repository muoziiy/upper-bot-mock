import React, { useState, useEffect } from 'react';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
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
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Manage Subjects</h1>

            <div className="px-4 mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="New Subject Name"
                        className="flex-1 bg-tg-bg border border-tg-hint/20 rounded-lg p-3 text-tg-text outline-none focus:border-tg-button"
                    />
                    <button
                        onClick={handleAddSubject}
                        disabled={loading || !newSubject.trim()}
                        className="bg-tg-button text-white p-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <Section title="Existing Subjects">
                {subjects.map((subject, index) => (
                    <ListItem
                        key={subject.id}
                        title={subject.name}
                        icon="📚"
                        isLast={index === subjects.length - 1}
                    />
                ))}
                {subjects.length === 0 && (
                    <div className="p-4 text-center text-tg-hint">No subjects found.</div>
                )}
            </Section>
        </div>
    );
};

export default AdminSubjects;
