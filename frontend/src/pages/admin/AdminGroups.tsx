import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminGroups: React.FC = () => {
    const { webApp } = useTelegram();
    const backButton = webApp.BackButton;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('groups');

    React.useEffect(() => {
        backButton.show();
        const handleBack = () => navigate(-1);
        backButton.onClick(handleBack);
        return () => {
            backButton.offClick(handleBack);
            backButton.hide();
        };
    }, [backButton, navigate]);

    return (
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Groups & Students</h1>

            <div className="px-4 mb-6">
                <SegmentedControl
                    options={[
                        { label: 'Groups', value: 'groups' },
                        { label: 'Students', value: 'students' },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {activeTab === 'groups' ? (
                <div className="space-y-6">
                    <Section title="English">
                        <ListItem
                            title="Elementary - Morning"
                            subtitle="Teacher: Mr. Anderson • 12 Students"
                            icon="🇬🇧"
                            showChevron
                        />
                        <ListItem
                            title="IELTS - Evening"
                            subtitle="Teacher: Ms. Davis • 8 Students"
                            icon="🇬🇧"
                            showChevron
                            isLast
                        />
                    </Section>

                    <Section title="Mathematics">
                        <ListItem
                            title="Algebra - Advanced"
                            subtitle="Teacher: Dr. Wilson • 15 Students"
                            icon="📐"
                            showChevron
                            isLast
                        />
                    </Section>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="px-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-tg-secondary text-tg-text p-3 rounded-lg border-none outline-none placeholder-tg-hint"
                        />
                    </div>
                    <Section title="All Students">
                        <ListItem
                            title="Alex Brown"
                            subtitle="+998 90 123 45 67"
                            value={<span className="text-green-500">Paid</span>}
                            showChevron
                        />
                        <ListItem
                            title="Sarah Connor"
                            subtitle="+998 90 987 65 43"
                            value={<span className="text-red-500">Unpaid</span>}
                            showChevron
                        />
                        <ListItem
                            title="Mike Ross"
                            subtitle="+998 93 555 44 33"
                            value={<span className="text-green-500">Paid</span>}
                            showChevron
                            isLast
                        />
                    </Section>
                </div>
            )}
        </div>
    );
};

export default AdminGroups;
