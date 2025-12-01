import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import TeacherInfoModal from '../components/profile/TeacherInfoModal';
import AttendanceCalendarModal from '../components/profile/AttendanceCalendarModal';
import SettingsModal from '../components/profile/SettingsModal';
import PaymentHistoryModal from '../components/profile/PaymentHistoryModal';
import SupportModal from '../components/profile/SupportModal';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';
import { mockService } from '../services/mockData';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const { dashboardData, loading, logout } = useAppData();
    const [showSettings, setShowSettings] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [supportInfo, setSupportInfo] = useState<any>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [selectedSubjectAttendance, setSelectedSubjectAttendance] = useState<any>(null);
    const [selectedSubjectPayments, setSelectedSubjectPayments] = useState<any>(null);

    // Use real student ID from DB, fallback to '---' if not set
    const studentId = dashboardData?.user.student_id || '---';

    useEffect(() => {
        const fetchSupportInfo = async () => {
            try {
                const data = await mockService.getStudentSettings();
                if (data.support_info) {
                    setSupportInfo(data.support_info);
                }
            } catch (e) {
                console.error('Failed to fetch support info', e);
            }
        };
        fetchSupportInfo();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-6 text-black dark:text-white">
            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} supportInfo={supportInfo} />
            <TeacherInfoModal
                teacher={selectedTeacher}
                isOpen={!!selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
            />
            {selectedSubjectAttendance && (
                <AttendanceCalendarModal
                    isOpen={!!selectedSubjectAttendance}
                    onClose={() => setSelectedSubjectAttendance(null)}
                    subjectName={selectedSubjectAttendance.name}
                    attendance={selectedSubjectAttendance.attendance}
                />
            )}
            {selectedSubjectPayments && (
                <PaymentHistoryModal
                    isOpen={!!selectedSubjectPayments}
                    onClose={() => setSelectedSubjectPayments(null)}
                    subjectName={selectedSubjectPayments.name}
                    payments={selectedSubjectPayments.payments}
                />
            )}

            <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg mb-3 relative">
                    {user?.emoji ? (
                        <span className="text-5xl">{user.emoji}</span>
                    ) : user?.photo_url ? (
                        <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>{dashboardData?.user.first_name?.[0] || 'U'}</span>
                    )}
                </div>
                {/* Paid Badge */}
                <div className="absolute top-[100px]">
                    {dashboardData?.groups?.some((g: any) => g.status === 'overdue') ? (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-[#F2F2F7] dark:border-black">
                            Overdue
                        </div>
                    ) : (
                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-[#F2F2F7] dark:border-black flex items-center gap-1">
                            <span>Paid</span>
                            <span>{dashboardData?.user.sex === 'female' ? '👧' : '👦'}</span>
                        </div>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white mt-2">
                    {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}
                </h1>
                <div className="flex items-center gap-2 text-[#8E8E93]">
                    <span className="capitalize">{dashboardData?.user.role}</span>
                    <span>•</span>
                    <span>ID: #{studentId}</span>
                </div>
            </div>



            {/* Account Settings */}
            <AdminSection title="Account">
                <AdminListItem
                    icon="⚙️"
                    iconColor="bg-gray-500"
                    title={t('profile.account_settings')}
                    onClick={() => setShowSettings(true)}
                    showChevron
                />
                <AdminListItem
                    icon="🔄"
                    iconColor="bg-blue-500"
                    title="Switch Role"
                    onClick={logout}
                    showChevron
                />
                <AdminListItem
                    icon="❓"
                    iconColor="bg-blue-500"
                    title="Support & Info"
                    onClick={() => setShowSupport(true)}
                    showChevron
                    isLast
                />
            </AdminSection>

            {/* My Subjects */}
            <div className="px-4 mt-6 mb-2 text-xs font-medium text-[#8E8E93] uppercase">
                {t('profile.my_subjects')}
            </div>

            {dashboardData?.groups && dashboardData.groups.length > 0 ? (
                dashboardData.groups.map((group: any) => (
                    <AdminSection key={group.id} title={group.name}>
                        {/* Teacher */}
                        <AdminListItem
                            icon="👨‍🏫"
                            iconColor="bg-orange-500"
                            title={t('profile.teacher')}
                            value={group.teacher ? `${group.teacher.first_name} ${group.teacher.last_name}` : "Not assigned"}
                            onClick={group.teacher ? () => setSelectedTeacher(group.teacher) : undefined}
                            showChevron={!!group.teacher}
                        />

                        {/* Payment History */}
                        <AdminListItem
                            icon="💰"
                            title={t('profile.payment_history')}
                            onClick={() => setSelectedSubjectPayments(group)}
                            showChevron
                        />
                    </AdminSection>
                ))
            ) : (
                <div className="text-center py-8 text-[#8E8E93]">
                    <p>No courses found.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
