import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { User, Phone, BookOpen } from 'lucide-react';

interface TeacherDetails {
    id: string;
    first_name: string;
    surname: string | null;
    phone_number: string | null;
    bio: string | null;
    username: string | null;
    telegram_id: number;
}

interface TeacherGroup {
    id: string;
    name: string;
    price: number;
    schedule: any;
    student_count: number;
}

const AdminTeacherDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [teacher, setTeacher] = useState<TeacherDetails | null>(null);
    const [groups, setGroups] = useState<TeacherGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => navigate(-1);
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [webApp, navigate]);

    useEffect(() => {
        if (id) {
            fetchTeacherDetails();
        }
    }, [id]);

    const fetchTeacherDetails = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teachers/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTeacher(data.teacher);
                setGroups(data.groups);
            } else {
                console.error('Failed to fetch teacher details');
            }
        } catch (e) {
            console.error('Error fetching teacher details', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
    }

    if (!teacher) {
        return <div className="flex h-screen items-center justify-center bg-tg-secondary text-tg-text">Teacher not found</div>;
    }

    const totalStudents = groups.reduce((sum, g) => sum + g.student_count, 0);
    const potentialRevenue = groups.reduce((sum, g) => sum + (g.price * g.student_count), 0);

    return (
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Teacher Details</h1>

            {/* Profile Section */}
            <Section title="Profile">
                <div className="p-4 flex flex-col items-center">
                    <div className="w-20 h-20 bg-tg-button/10 rounded-full flex items-center justify-center mb-3">
                        <User size={40} className="text-tg-button" />
                    </div>
                    <h2 className="text-xl font-bold text-tg-text">{teacher.first_name} {teacher.surname}</h2>
                    <p className="text-tg-hint text-sm">@{teacher.username || 'No username'}</p>
                </div>
                <ListItem
                    title="Phone Number"
                    subtitle={teacher.phone_number || 'Not provided'}
                    icon={<Phone size={20} className="text-tg-hint" />}
                />
                <ListItem
                    title="Bio"
                    subtitle={teacher.bio || 'No bio provided'}
                    icon={<BookOpen size={20} className="text-tg-hint" />}
                />
            </Section>

            {/* Stats Section */}
            <Section title="Overview">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <div className="bg-tg-bg p-3 rounded-xl border border-tg-secondary">
                        <div className="text-tg-hint text-xs mb-1">Total Students</div>
                        <div className="text-xl font-bold text-tg-text">{totalStudents}</div>
                    </div>
                    <div className="bg-tg-bg p-3 rounded-xl border border-tg-secondary">
                        <div className="text-tg-hint text-xs mb-1">Active Groups</div>
                        <div className="text-xl font-bold text-tg-text">{groups.length}</div>
                    </div>
                    <div className="col-span-2 bg-tg-bg p-3 rounded-xl border border-tg-secondary">
                        <div className="text-tg-hint text-xs mb-1">Potential Monthly Revenue</div>
                        <div className="text-xl font-bold text-green-500">${potentialRevenue.toLocaleString()}</div>
                        <div className="text-xs text-tg-hint mt-1">Based on active students * group price</div>
                    </div>
                </div>
            </Section>

            {/* Groups Section */}
            <Section title="Groups">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <ListItem
                            key={group.id}
                            title={group.name}
                            subtitle={`${group.student_count} students • $${group.price}/month`}
                            icon={<BookOpen size={20} className="text-tg-button" />}
                            rightElement={
                                <div className="text-xs text-tg-hint">
                                    {/* Could show schedule summary here */}
                                </div>
                            }
                            onClick={() => navigate('/admin/groups')} // Or to specific group details if available
                            showChevron
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-tg-hint">No groups assigned</div>
                )}
            </Section>
        </div>
    );
};

export default AdminTeacherDetails;
