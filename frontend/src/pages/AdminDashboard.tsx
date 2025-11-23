import React from 'react';
import { useTelegram } from '../context/TelegramContext';

const AdminDashboard: React.FC = () => {
    const { user } = useTelegram();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-tg-text">Admin Dashboard</h1>
            <p className="text-tg-hint mb-4">Welcome, {user?.first_name}!</p>

            <div className="space-y-4">
                <div className="bg-tg-secondary p-4 rounded-lg shadow">
                    <h2 className="font-bold text-tg-text">User Management</h2>
                    <button className="mt-2 bg-tg-button text-tg-button-text px-4 py-2 rounded">
                        Manage Users
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
