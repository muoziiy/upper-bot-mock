import React, { useEffect } from 'react';
import { useTelegram } from '../../../context/TelegramContext';
import { Calendar } from 'lucide-react';

interface AdminAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

const AdminAttendanceModal: React.FC<AdminAttendanceModalProps> = ({ isOpen, onClose, studentName }) => {
    const { webApp } = useTelegram();

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            const handleBack = () => onClose();
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, webApp, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-tg-bg">
                <h2 className="text-lg font-semibold text-tg-text">Attendance</h2>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-tg-button/10 rounded-full flex items-center justify-center text-tg-button">
                    <Calendar size={40} />
                </div>
                <h3 className="text-xl font-bold text-tg-text">Coming Soon</h3>
                <p className="text-tg-hint">
                    Attendance tracking for <span className="font-semibold text-tg-text">{studentName}</span> is currently under development.
                </p>
            </div>
        </div>
    );
};

export default AdminAttendanceModal;
