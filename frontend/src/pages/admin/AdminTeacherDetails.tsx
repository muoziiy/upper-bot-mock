import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { User, Phone, BookOpen, CreditCard } from 'lucide-react';
import AdminTeacherPaymentModal from './components/AdminTeacherPaymentModal';

interface TeacherDetails {
    id: string;
    first_name: string;
    onboarding_first_name?: string;
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => {
                if (showPaymentModal) {
                    setShowPaymentModal(false);
                } else {
                    navigate(-1);
                }
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                if (!showPaymentModal) webApp.BackButton.hide();
            };
        }
    }, [webApp, navigate, showPaymentModal]);

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


    return (
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Teacher Details</h1>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-24 h-24 bg-tg-secondary rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <User size={48} className="text-tg-hint" />
                </div>
                <h2 className="text-2xl font-bold text-tg-text text-center leading-tight">
                    {teacher.onboarding_first_name || teacher.first_name} {teacher.surname}
                </h2>
                <p className="text-tg-hint text-base">@{teacher.username || 'No username'}</p>
            </div>

            {/* Personal Info Section */}
            <Section title="Personal Info">
                <ListItem
                    title="Phone Number"
                    subtitle={teacher.phone_number || 'Not provided'}
                    icon={<Phone size={20} className="text-tg-button" />}
                    onClick={() => {
                        if (teacher.phone_number) {
                            window.open(`tel:${teacher.phone_number}`);
                        }
                    }}
                />
                <ListItem
                    title="Bio"
                    subtitle={teacher.bio || 'No bio provided'}
                    icon={<BookOpen size={20} className="text-tg-button" />}
                />
            </Section>

            {/* Finance Section */}
            <Section title="Finance">
                <ListItem
                    title="Payment History"
                    subtitle="View all payouts"
                    icon={<CreditCard size={20} className="text-green-500" />}
                    onClick={() => setShowPaymentModal(true)}
                    showChevron
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
                </div>
            </Section>

            {/* Groups Section */}
            <Section title="Groups">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <ListItem
                            key={group.id}
                            title={group.name}
                            subtitle={`${group.student_count} students • ${group.price.toLocaleString()} UZS/month`}
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

            {/* Payment Modal */}
            <AdminTeacherPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                teacherId={id!}
                teacherName={`${teacher.onboarding_first_name || teacher.first_name} ${teacher.surname || ''}`}
            />
        </div>
    );
};

export default AdminTeacherDetails;
