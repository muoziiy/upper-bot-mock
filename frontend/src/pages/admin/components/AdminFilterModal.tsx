import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface AdminFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        status: 'all' | 'paid' | 'unpaid' | 'overdue';
        month: number;
        year: number;
    };
    onApply: (filters: any) => void;
}

const AdminFilterModal: React.FC<AdminFilterModalProps> = ({ isOpen, onClose, filters, onApply }) => {
    const { webApp } = useTelegram();
    const [localFilters, setLocalFilters] = React.useState(filters);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
            return () => {
                webApp.BackButton.offClick(onClose);
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, onClose, webApp]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-tg-bg w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl pb-safe"
            >
                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10 bg-tg-bg">
                    <h2 className="text-lg font-semibold text-tg-text">Filters</h2>
                    <div className="flex gap-2">
                        {/* Clear All Button */}
                        <button
                            onClick={() => setLocalFilters({ status: 'all', month: new Date().getMonth() + 1, year: new Date().getFullYear() })}
                            className="text-xs font-medium text-tg-button hover:opacity-80 px-2 py-1"
                        >
                            Clear All
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-tg-hint/10 rounded-full">
                            <X size={20} className="text-tg-hint" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6 bg-tg-bg h-full max-h-[80vh] overflow-y-auto">
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-tg-hint uppercase ml-1">Payment Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setLocalFilters({ ...localFilters, status: status as any })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                        localFilters.status === status
                                            ? "bg-tg-button text-white border-tg-button shadow-md"
                                            : "bg-tg-secondary text-tg-text border-transparent hover:bg-tg-secondary/80"
                                    )}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-tg-hint uppercase ml-1">Month</label>
                        <div className="grid grid-cols-3 gap-2">
                            {months.map((month, idx) => (
                                <button
                                    key={month}
                                    onClick={() => setLocalFilters({ ...localFilters, month: idx + 1 })}
                                    className={cn(
                                        "px-2 py-2 rounded-lg text-xs font-medium transition-all text-center border",
                                        localFilters.month === idx + 1
                                            ? "bg-tg-button text-white border-tg-button shadow-md"
                                            : "bg-tg-secondary text-tg-text border-transparent hover:bg-tg-secondary/80"
                                    )}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleApply}
                            className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminFilterModal;
