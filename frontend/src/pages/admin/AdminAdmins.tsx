import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminAdmins: React.FC = () => {
    const { adminRequests } = useAppData();

    // Filter pending requests
    const pendingRequests = adminRequests.filter(req => req.status === 'pending');

    // Mock list of current admins (since we don't fetch them all separately yet, or we can use a mock)
    // In a real app, we would fetch users where role='admin'
    const currentAdmins = [
        { id: '1', name: 'John Doe', role: 'Admin' },
        { id: '2', name: 'Jane Smith', role: 'Admin' },
    ];

    const handleApprove = async (id: string) => {
        // Call API to approve
        console.log('Approve', id);
        // Implement API call here
    };

    const handleDecline = async (id: string) => {
        // Call API to decline
        console.log('Decline', id);
    };

    return (
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Admins</h1>

            {pendingRequests.length > 0 && (
                <Section title="New Admin Requests">
                    {pendingRequests.map((req, index) => (
                        <ListItem
                            key={req.id}
                            title={req.users?.first_name || 'Unknown User'}
                            subtitle={`@${req.users?.username || 'no_username'} • ID: ${req.user_id}`}
                            icon="🔔"
                            rightElement={
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDecline(req.id)}
                                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium"
                                    >
                                        Decline
                                    </button>
                                </div>
                            }
                            isLast={index === pendingRequests.length - 1}
                        />
                    ))}
                </Section>
            )}

            <Section title="Current Admins">
                {currentAdmins.map((admin, index) => (
                    <ListItem
                        key={admin.id}
                        title={admin.name}
                        subtitle={admin.role}
                        icon="🛡️"
                        isLast={index === currentAdmins.length - 1}
                    />
                ))}
            </Section>
        </div>
    );
};

export default AdminAdmins;
