import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { useTelegram } from '../../context/TelegramContext';
import { Check, AlertTriangle } from 'lucide-react';

const AdminCenterSettings: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<'monthly_fixed' | 'monthly_rolling' | 'lesson_based' | null>(null);

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

    const handleUpdatePaymentType = async (type: 'monthly_fixed' | 'monthly_rolling' | 'lesson_based') => {
        if (!window.confirm('Are you sure? This will update the payment system for ALL students. This process may take some time.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/payment-type`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_type: type })
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

    return (
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Center Settings</h1>

            <Section title="Global Payment System">
                <div className="px-4 mb-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-yellow-500/90">
                            Changing this setting will update the payment calculation logic for <strong>ALL</strong> active students.
                            Please allow some time for the changes to propagate.
                        </p>
                    </div>
                </div>

                <ListItem
                    title="Monthly (Fixed Date)"
                    subtitle="Payments due on specific date (e.g. 1st of month)"
                    icon="📅"
                    rightElement={selectedType === 'monthly_fixed' ? <Check className="text-green-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('monthly_fixed')}
                    disabled={loading}
                />
                <ListItem
                    title="Monthly (Rolling)"
                    subtitle="Payments due on join date anniversary"
                    icon="🔄"
                    rightElement={selectedType === 'monthly_rolling' ? <Check className="text-green-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('monthly_rolling')}
                    disabled={loading}
                />
                <ListItem
                    title="Lesson Based"
                    subtitle="Payments due every 12 lessons"
                    icon="🎓"
                    rightElement={selectedType === 'lesson_based' ? <Check className="text-green-500" size={20} /> : null}
                    onClick={() => handleUpdatePaymentType('lesson_based')}
                    disabled={loading}
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminCenterSettings;
