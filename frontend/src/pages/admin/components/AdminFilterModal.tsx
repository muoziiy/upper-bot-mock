import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

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
    const [localFilters, setLocalFilters] = React.useState(filters);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-tg-bg w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl"
            >
                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10">
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

                <div className="p-4 space-y-6">
                    {/* Status Filter */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-tg-hint uppercase">Payment Status</label>
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
                        <label className="text-sm font-medium text-tg-hint uppercase">Month</label>
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
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
                    <button
                        onClick={handleApply}
                        className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:opacity-90 transition-opacity"
                    >
                        Apply Filters
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminFilterModal;
