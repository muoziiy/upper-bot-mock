import React from 'react';
import { Card } from '../ui/Card';
import { Calendar, Check, X, Clock } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subject: string;
}

interface AttendanceHistoryProps {
    attendance: AttendanceRecord[];
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ attendance }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'present': return { icon: <Check className="h-4 w-4" />, color: 'bg-green-500/20 text-green-500' };
            case 'absent': return { icon: <X className="h-4 w-4" />, color: 'bg-red-500/20 text-red-500' };
            case 'late': return { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500/20 text-yellow-500' };
            default: return { icon: <Calendar className="h-4 w-4" />, color: 'bg-gray-500/20 text-gray-500' };
        }
    };

    return (
        <div className="space-y-3">
            {attendance.map((record) => {
                const config = getStatusConfig(record.status);
                return (
                    <Card key={record.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}>
                                {config.icon}
                            </div>
                            <div>
                                <p className="font-medium">{record.subject}</p>
                                <p className="text-xs text-tg-hint">{record.date}</p>
                            </div>
                        </div>
                        <div className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${config.color}`}>
                            {record.status}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default AttendanceHistory;
