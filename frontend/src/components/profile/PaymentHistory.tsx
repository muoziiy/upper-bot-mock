import React from 'react';
import { Card } from '../ui/Card';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <CreditCard className="h-5 w-5 text-tg-hint" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount);
    };

    return (
        <div className="space-y-3">
            {payments.map((payment) => (
                <Card key={payment.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tg-bg/50">
                            {getStatusIcon(payment.status)}
                        </div>
                        <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-xs text-tg-hint">{payment.date}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                        <p className={`text-xs capitalize ${payment.status === 'paid' ? 'text-green-500' :
                                payment.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                            {payment.status}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default PaymentHistory;
