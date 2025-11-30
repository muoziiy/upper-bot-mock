import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { Trash2 } from 'lucide-react';

interface AdminUser {
    id: string;
    first_name: string;
    surname: string | null;
    role: 'admin' | 'super_admin';
    telegram_id: number;
    username: string | null;
}

const AdminManageAdmins: React.FC = () => {
    const navigate = useNavigate();
    const { webApp, user } = useTelegram();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => navigate('/admin/actions');
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [webApp, navigate]);

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/admins`);
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (e) {
            console.error('Failed to fetch admins', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDemote = async (adminId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from admins? They will become a regular user.`)) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/admins/demote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId })
            });

            if (res.ok) {
                alert('Admin removed successfully');
                fetchAdmins(); // Refresh list
            } else {
                alert('Failed to remove admin');
            }
        } catch (e) {
            console.error('Error removing admin', e);
            alert('An error occurred');
        }
    };

    return (
        <div className="page-content pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000] min-h-screen">
            <h1 className="text-3xl font-bold mb-4 px-4 text-black dark:text-white">Manage Admins</h1>

            <AdminSection title="Current Administrators">
                {loading ? (
                    <div className="p-4 text-center text-[#8E8E93]">Loading...</div>
                ) : admins.length > 0 ? (
                    admins.map((admin, index) => (
                        <AdminListItem
                            key={admin.id}
                            title={`${admin.first_name} ${admin.surname || ''}`}
                            // subtitle removed
                            value={<span className="text-sm text-[#8E8E93]">@{admin.username || 'No username'}</span>}
                            icon={admin.role === 'super_admin' ? "🛡️" : "👤"}
                            iconColor={admin.role === 'super_admin' ? "bg-yellow-500" : "bg-gray-500"}
                            rightElement={
                                admin.role !== 'super_admin' && admin.telegram_id !== user?.id ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDemote(admin.id, admin.first_name);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                ) : null
                            }
                            isLast={index === admins.length - 1}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-[#8E8E93]">No admins found.</div>
                )}
            </AdminSection>
        </div>
    );
};

export default AdminManageAdmins;
