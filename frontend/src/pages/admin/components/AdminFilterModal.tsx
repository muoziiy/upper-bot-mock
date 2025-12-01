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
        subjectId: string;
    };
    onApply: (filters: any) => void;
    subjects: { id: string; name: string }[];
}

const AdminFilterModal: React.FC<AdminFilterModalProps> = ({ isOpen, onClose, filters, onApply, subjects }) => {
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
                className="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl pb-safe"
            >
                <div className="flex items-center justify-between p-4 border-b border-[#C6C6C8] dark:border-[#38383A] bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                    <h2 className="text-lg font-semibold text-black dark:text-white">Filters</h2>
                    <div className="flex gap-2">
                        {/* Clear All Button */}
                        <button
                            onClick={() => setLocalFilters({ status: 'all', month: new Date().getMonth() + 1, year: new Date().getFullYear(), subjectId: 'all' })}
                            className="text-xs font-medium text-blue-500 hover:opacity-80 px-2 py-1"
                        >
                            Clear All
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                            <X size={20} className="text-[#8E8E93]" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6 bg-[#F2F2F7] dark:bg-[#000000] h-full max-h-[80vh] overflow-y-auto">
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#8E8E93] uppercase ml-1">Payment Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setLocalFilters({ ...localFilters, status: status as any })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                        localFilters.status === status
                                            ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                            : "bg-white dark:bg-[#1C1C1E] text-black dark:text-white border-transparent hover:bg-white/80 dark:hover:bg-[#2C2C2E]"
                                    )}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#8E8E93] uppercase ml-1">Subject</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setLocalFilters({ ...localFilters, subjectId: 'all' })}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                    localFilters.subjectId === 'all'
                                        ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                        : "bg-white dark:bg-[#1C1C1E] text-black dark:text-white border-transparent hover:bg-white/80 dark:hover:bg-[#2C2C2E]"
                                )}
                            >
                                All Subjects
                            </button>
                            {subjects.map((subject) => (
                                <button
                                    key={subject.id}
                                    onClick={() => setLocalFilters({ ...localFilters, subjectId: subject.id })}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                        localFilters.subjectId === subject.id
                                            ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                            : "bg-white dark:bg-[#1C1C1E] text-black dark:text-white border-transparent hover:bg-white/80 dark:hover:bg-[#2C2C2E]"
                                    )}
                                >
                                    {subject.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#8E8E93] uppercase ml-1">Month</label>
                        <div className="grid grid-cols-3 gap-2">
                            {months.map((month, idx) => (
                                <button
                                    key={month}
                                    onClick={() => setLocalFilters({ ...localFilters, month: idx + 1 })}
                                    className={cn(
                                        "px-2 py-2 rounded-lg text-xs font-medium transition-all text-center border",
                                        localFilters.month === idx + 1
                                            ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                            : "bg-white dark:bg-[#1C1C1E] text-black dark:text-white border-transparent hover:bg-white/80 dark:hover:bg-[#2C2C2E]"
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
                            className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
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
