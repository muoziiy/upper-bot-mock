import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

interface PendingRequest {
    id: string;
    first_name: string;
    onboarding_first_name?: string;
    surname: string;
    age: number;
    sex: string;
    role: 'guest' | 'waiting_staff';
    created_at: string;
    users?: {
        first_name: string;
        onboarding_first_name?: string;
        username: string;
    };
    user_id?: string;
}

const AdminRequests: React.FC = () => {
    const { adminRequests } = useAppData();
    const [pendingStudentStaff, setPendingStudentStaff] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter pending admin requests
    const pendingAdminRequests = adminRequests.filter(req => req.status === 'pending');

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pending-requests`);
            if (res.ok) {
                const data = await res.json();
                setPendingStudentStaff(data);
            }
        } catch (e) {
            console.error('Failed to fetch pending requests', e);
        }
    };

    const handleApproveStudentStaff = async (userId: string, type: 'student' | 'staff') => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/approve-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type })
            });

            if (res.ok) {
                fetchPendingRequests();
            } else {
                alert('Failed to approve request');
            }
        } catch (e) {
            console.error('Error approving request', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeclineStudentStaff = async (userId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/decline-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                fetchPendingRequests();
            } else {
                alert('Failed to decline request');
            }
        } catch (e) {
            console.error('Error declining request', e);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAdmin = async (id: string) => {
        console.log('Approve admin request', id);
        // This should be implemented via AppDataContext or API call
    };

    const handleDeclineAdmin = async (id: string) => {
        console.log('Decline admin request', id);
    };

    return (
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Manage Requests</h1>

            {/* Student/Staff Requests */}
            {pendingStudentStaff.length > 0 && (
                <Section title="Pending Student & Staff Requests">
                    {pendingStudentStaff.map((req, index) => (
                        <ListItem
                            key={req.id}
                            title={`${req.onboarding_first_name || req.first_name} ${req.surname}`}
                            subtitle={`${req.role === 'guest' ? '🎓 Student' : '👨‍🏫 Staff'} • Age: ${req.age} • Sex: ${req.sex}`}
                            icon={req.role === 'guest' ? '🎓' : '👨‍🏫'}
                            rightElement={
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApproveStudentStaff(req.id, req.role === 'guest' ? 'student' : 'staff')}
                                        disabled={loading}
                                        className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDeclineStudentStaff(req.id)}
                                        disabled={loading}
                                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                </div>
                            }
                            isLast={index === pendingStudentStaff.length - 1}
                        />
                    ))}
                </Section>
            )}

            {/* Admin Requests */}
            {pendingAdminRequests.length > 0 && (
                <Section title="New Admin Requests">
                    {pendingAdminRequests.map((req, index) => (
                        <ListItem
                            key={req.id}
                            title={req.users?.onboarding_first_name || req.users?.first_name || 'Unknown User'}
                            subtitle={`@${req.users?.username || 'no_username'} • ID: ${req.user_id}`}
                            icon="🔔"
                            rightElement={
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApproveAdmin(req.id)}
                                        className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDeclineAdmin(req.id)}
                                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium"
                                    >
                                        Decline
                                    </button>
                                </div>
                            }
                            isLast={index === pendingAdminRequests.length - 1}
                        />
                    ))}
                </Section>
            )}

            {pendingStudentStaff.length === 0 && pendingAdminRequests.length === 0 && (
                <div className="px-4 py-8 text-center text-tg-hint">
                    No pending requests
                </div>
            )}
        </div>
    );
};

export default AdminRequests;
