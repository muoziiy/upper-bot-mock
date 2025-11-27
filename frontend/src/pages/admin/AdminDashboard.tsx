import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminDashboard: React.FC = () => {
    const { user } = useTelegram();
    const navigate = useNavigate();
    const [studentCount, setStudentCount] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats/general`);
                if (res.ok) {
                    const data = await res.json();
                    setStudentCount(data.totalStudents);
                }
            } catch (e) {
                console.error('Failed to fetch student count', e);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Admin Dashboard</h1>
            <p className="text-tg-hint mb-4 px-4">Welcome, {user?.first_name}!</p>

            <Section>
                <ListItem
                    icon="👨‍🎓"
                    title="Students"
                    subtitle={studentCount !== null ? `${studentCount} Total Students` : 'Manage Students'}
                    value={studentCount !== null ? String(studentCount) : undefined}
                    onClick={() => navigate('/admin/students')}
                    showChevron
                />
                <ListItem
                    icon="📊"
                    title="Stats"
                    subtitle="Payments & General Stats"
                    onClick={() => navigate('/admin/stats')}
                    showChevron
                />
                <ListItem
                    icon="👥"
                    title="Groups"
                    subtitle="Manage Groups"
                    onClick={() => navigate('/admin/groups')}
                    showChevron
                />
                <ListItem
                    icon="🛡️"
                    title="Admins"
                    subtitle="Manage Admins & Requests"
                    onClick={() => navigate('/admin/admins')}
                    showChevron
                />
                <ListItem
                    icon="⚡"
                    title="Actions"
                    subtitle="Quick Actions"
                    onClick={() => navigate('/admin/actions')}
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminDashboard;
