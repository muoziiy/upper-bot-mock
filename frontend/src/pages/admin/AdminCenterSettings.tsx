import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { useTelegram } from '../../context/TelegramContext';
import { Check, AlertTriangle } from 'lucide-react';

const AdminCenterSettings: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<'monthly_fixed' | 'monthly_rolling' | 'lesson_based' | null>(null);
    const [shouldBroadcast, setShouldBroadcast] = useState(false);
    const [reminders, setReminders] = useState({ payment: true, class: true });

    const [supportInfo, setSupportInfo] = useState({
        admin_profile_link: '',
        admin_phone: '',
        working_hours: '',
        location_link: '',
        location_text: ''
    });

    React.useEffect(() => {
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

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.default_payment_type) {
                        setSelectedType(data.default_payment_type);
                    }
                    if (data.support_info) {
                        setSupportInfo(prev => ({ ...prev, ...data.support_info }));
                    }
                    setReminders({
                        payment: data.enable_payment_reminders ?? true,
                        class: data.enable_class_reminders ?? true
                    });
                }
            } catch (e) {
                console.error('Failed to fetch settings', e);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateReminders = async (type: 'payment' | 'class') => {
        const newReminders = {
            ...reminders,
            [type]: !reminders[type]
        };
        setReminders(newReminders); // Optimistic update

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/reminders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enable_payment_reminders: newReminders.payment,
                    enable_class_reminders: newReminders.class
                })
            });
        } catch (e) {
            console.error('Error updating reminders', e);
            setReminders(reminders); // Revert on error
        }
    };

    const handleUpdatePaymentType = async (type: 'monthly_fixed' | 'monthly_rolling' | 'lesson_based') => {
        if (!window.confirm('Are you sure? This will update the payment system for ALL students. This process may take some time.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/payment-type`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_type: type,
                    broadcast: shouldBroadcast
                })
            });

            if (res.ok) {
                setSelectedType(type);
                alert('Payment settings updated successfully!');
            } else {
                alert('Failed to update settings');
            }
        } catch (e) {
            console.error('Error updating settings', e);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSupportInfo = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/support`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ support_info: supportInfo })
            });

            if (res.ok) {
                alert('Support info updated successfully!');
            } else {
                alert('Failed to update support info');
            }
        } catch (e) {
            console.error('Error updating support info', e);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000] min-h-screen">
            <h1 className="text-3xl font-bold mb-4 px-4 text-black dark:text-white">Center Settings</h1>

            <AdminSection title="Global Payment System">
                <div className="px-4 mb-4 space-y-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[10px] p-3 flex gap-3 items-start">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-yellow-500/90">
                            Changing this setting will update the payment calculation logic for <strong>ALL</strong> active students.
                            Please allow some time for the changes to propagate.
                        </p>
                    </div>

                    {/* Broadcast Toggle */}
                    <div className="flex items-center justify-between bg-white dark:bg-[#1C1C1E] p-3 rounded-[10px]">
                        <span className="text-sm font-medium text-black dark:text-white">Broadcast changes to all students</span>
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${shouldBroadcast ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'}`}
                            onClick={() => setShouldBroadcast(!shouldBroadcast)}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${shouldBroadcast ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </div>
                    </div>
                </div>

                <AdminListItem
                    title="Monthly (Fixed Date)"
                    // subtitle removed
                    icon="📅"
                    iconColor="bg-blue-500"
                    rightElement={selectedType === 'monthly_fixed' ? <Check className="text-blue-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('monthly_fixed')}
                    disabled={loading}
                />
                <AdminListItem
                    title="Monthly (Rolling)"
                    // subtitle removed
                    icon="🔄"
                    iconColor="bg-purple-500"
                    rightElement={selectedType === 'monthly_rolling' ? <Check className="text-blue-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('monthly_rolling')}
                    disabled={loading}
                />
                <AdminListItem
                    title="Lesson Based"
                    // subtitle removed
                    icon="🎓"
                    iconColor="bg-orange-500"
                    rightElement={selectedType === 'lesson_based' ? <Check className="text-blue-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('lesson_based')}
                    disabled={loading}
                    isLast
                />
            </AdminSection>

            <AdminSection title="Notifications">
                <AdminListItem
                    title="Payment Reminders"
                    icon="💰"
                    iconColor="bg-green-500"
                    rightElement={
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${reminders.payment ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'}`}
                            onClick={() => handleUpdateReminders('payment')}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${reminders.payment ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </div>
                    }
                />
                <AdminListItem
                    title="Class Reminders"
                    icon="⏰"
                    iconColor="bg-blue-500"
                    rightElement={
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${reminders.class ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'}`}
                            onClick={() => handleUpdateReminders('class')}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${reminders.class ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </div>
                    }
                    isLast
                />
            </AdminSection>

            <AdminSection title="Support & Contact Info">
                <div className="p-4 space-y-3 bg-white dark:bg-[#1C1C1E]">
                    <div>
                        <label className="text-xs text-[#8E8E93] mb-1 block">Admin Profile Link (Telegram)</label>
                        <input
                            type="text"
                            value={supportInfo.admin_profile_link}
                            onChange={(e) => setSupportInfo({ ...supportInfo, admin_profile_link: e.target.value })}
                            placeholder="https://t.me/username"
                            className="w-full bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-2 rounded-[10px] border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#8E8E93] mb-1 block">Admin Phone Number</label>
                        <input
                            type="text"
                            value={supportInfo.admin_phone}
                            onChange={(e) => setSupportInfo({ ...supportInfo, admin_phone: e.target.value })}
                            placeholder="+998 90 123 45 67"
                            className="w-full bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-2 rounded-[10px] border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#8E8E93] mb-1 block">Working Hours</label>
                        <input
                            type="text"
                            value={supportInfo.working_hours}
                            onChange={(e) => setSupportInfo({ ...supportInfo, working_hours: e.target.value })}
                            placeholder="Mon-Sat, 9:00 - 18:00"
                            className="w-full bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-2 rounded-[10px] border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#8E8E93] mb-1 block">Location Text</label>
                        <input
                            type="text"
                            value={supportInfo.location_text}
                            onChange={(e) => setSupportInfo({ ...supportInfo, location_text: e.target.value })}
                            placeholder="Tashkent, Chilonzor..."
                            className="w-full bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-2 rounded-[10px] border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#8E8E93] mb-1 block">Location Link (Google Maps)</label>
                        <input
                            type="text"
                            value={supportInfo.location_link}
                            onChange={(e) => setSupportInfo({ ...supportInfo, location_link: e.target.value })}
                            placeholder="https://maps.google.com/..."
                            className="w-full bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-2 rounded-[10px] border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <button
                        onClick={handleSaveSupportInfo}
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-[10px] font-medium mt-2 active:opacity-80 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? 'Saving...' : 'Save Support Info'}
                    </button>
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminCenterSettings;
