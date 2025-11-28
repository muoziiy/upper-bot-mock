import React, { useState } from 'react';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { Search } from 'lucide-react';

const AdminGroups: React.FC = () => {
    const [activeTab, setActiveTab] = useState('groups');

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-black dark:text-white">Groups & Students</h1>

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
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full bg-gray-200 dark:bg-black/20 text-black dark:text-white pl-9 pr-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint"
                            />
                        </div>
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
