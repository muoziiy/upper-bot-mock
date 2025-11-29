import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { FileText, Users, DollarSign, Download } from 'lucide-react';

const AdminExportData: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();

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

    const handleExport = (type: string) => {
        webApp?.showAlert(`Exporting ${type} data... This feature is coming soon.`);
    };

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-tg-text">Export Data</h1>

            <Section title="Reports">
                <ListItem
                    title="Students List"
                    subtitle="Export all student details as CSV"
                    icon={<Users size={20} className="text-blue-500" />}
                    rightElement={<Download size={20} className="text-tg-hint" />}
                    onClick={() => handleExport('Students')}
                />
                <ListItem
                    title="Financial Report"
                    subtitle="Export payment history and revenue"
                    icon={<DollarSign size={20} className="text-green-500" />}
                    rightElement={<Download size={20} className="text-tg-hint" />}
                    onClick={() => handleExport('Financial')}
                />
                <ListItem
                    title="Attendance Records"
                    subtitle="Export attendance logs for all groups"
                    icon={<FileText size={20} className="text-purple-500" />}
                    rightElement={<Download size={20} className="text-tg-hint" />}
                    isLast
                    onClick={() => handleExport('Attendance')}
                />
            </Section>
        </div>
    );
};

export default AdminExportData;
