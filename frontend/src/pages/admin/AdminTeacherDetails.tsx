import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import AdminTeacherPaymentModal from './components/AdminTeacherPaymentModal';
import { mockService } from '../../services/mockData';

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
            if (id) {
                const data = await mockService.getTeacherDetails(id);
                setTeacher(data.teacher);
                setGroups(data.groups);
            }
        } catch (e) {
            console.error('Error fetching teacher details', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-[#8E8E93]">Loading...</div>;
    }

    if (!teacher) {
        return <div className="flex h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-[#8E8E93]">Teacher not found</div>;
    }

    const totalStudents = groups.reduce((sum, g) => sum + g.student_count, 0);


    return (
        <div className="page-content pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000] min-h-screen">
            <h1 className="text-3xl font-bold mb-4 px-4 text-black dark:text-white">Teacher Details</h1>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-24 h-24 bg-[#E3E3E8] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mb-3 shadow-sm text-4xl">
                    👨‍🏫
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white text-center leading-tight">
                    {teacher.onboarding_first_name || teacher.first_name} {teacher.surname}
                </h2>
                <p className="text-[#8E8E93] text-base">@{teacher.username || 'No username'}</p>
            </div>

            {/* Personal Info Section */}
            <AdminSection title="Personal Info">
                <AdminListItem
                    title="Phone Number"
                    value={teacher.phone_number || 'Not provided'}
                    icon="📞"
                    iconColor="bg-green-500"
                    onClick={() => {
                        if (teacher.phone_number) {
                            window.open(`tel:${teacher.phone_number}`);
                        }
                    }}
                />
                <AdminListItem
                    title="Bio"
                    value={teacher.bio || 'No bio provided'}
                    icon="📝"
                    iconColor="bg-gray-500"
                    isLast
                />
            </AdminSection>

            {/* Finance Section */}
            <AdminSection title="Finance">
                <AdminListItem
                    title="Payment History"
                    icon="💳"
                    iconColor="bg-blue-500"
                    onClick={() => setShowPaymentModal(true)}
                    showChevron
                    isLast
                />
            </AdminSection>

            {/* Stats Section */}
            <AdminSection title="Overview">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-[10px] border-none shadow-sm">
                        <div className="text-[#8E8E93] text-xs mb-1">Total Students</div>
                        <div className="text-xl font-bold text-black dark:text-white">{totalStudents}</div>
                    </div>
                    <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-[10px] border-none shadow-sm">
                        <div className="text-[#8E8E93] text-xs mb-1">Active Groups</div>
                        <div className="text-xl font-bold text-black dark:text-white">{groups.length}</div>
                    </div>
                </div>
            </AdminSection>

            {/* Groups Section */}
            <AdminSection title="Groups">
                {groups.length > 0 ? (
                    groups.map((group, index) => (
                        <AdminListItem
                            key={group.id}
                            title={group.name}
                            value={
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-[#8E8E93]">{group.student_count} students</span>
                                    <span className="text-xs text-[#8E8E93]">{group.price.toLocaleString()} UZS</span>
                                </div>
                            }
                            icon="📚"
                            iconColor="bg-orange-500"
                            onClick={() => navigate('/admin/groups')} // Or to specific group details if available
                            showChevron
                            isLast={index === groups.length - 1}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">No groups assigned</div>
                )}
            </AdminSection>

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
