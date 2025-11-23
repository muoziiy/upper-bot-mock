import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';

interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
}

interface PaymentHistoryProps {
    payments: PaymentRecord[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    const groupedPayments = useMemo(() => {
        const groups: { [key: string]: PaymentRecord[] } = {};

        payments.forEach(payment => {
            const date = new Date(payment.date);
            const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(payment);
        });

        return groups;
    }, [payments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <CreditCard className="h-5 w-5 text-tg-hint" />;
        }
    };

    return (
        <div className="space-y-6">
            {Object.entries(groupedPayments).map(([month, monthPayments]) => (
                <div key={month} className="space-y-2">
                    <h3 className="px-1 text-sm font-medium text-tg-hint sticky top-0 bg-tg-secondary py-1 z-10">
                        {month}
                    </h3>
                    <div className="space-y-2">
                        {monthPayments.map((payment) => (
                            <Card key={payment.id} className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tg-bg/50">
                                        {getStatusIcon(payment.status)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{payment.description}</p>
                                        <p className="text-xs text-tg-hint">{new Date(payment.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{formatCurrency(payment.amount)}</p>
                                    <p className={`text-xs capitalize ${payment.status === 'paid' ? 'text-green-500' :
                                            payment.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {payment.status}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PaymentHistory;
