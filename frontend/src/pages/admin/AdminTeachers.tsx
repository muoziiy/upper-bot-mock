import React from 'react';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminTeachers: React.FC = () => {

    return (
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Teachers</h1>

            <div className="px-4 mb-4">
                <input
                    type="text"
                    placeholder="Search teachers..."
                    className="w-full bg-tg-secondary text-tg-text p-3 rounded-lg border-none outline-none placeholder-tg-hint"
                />
            </div>

            <Section title="English Department">
                <ListItem
                    title="Mr. Thomas Anderson"
                    subtitle="IELTS, General English"
                    icon="👨‍🏫"
                    showChevron
                />
                <ListItem
                    title="Ms. Sarah Davis"
                    subtitle="Kids English, Beginner"
                    icon="👩‍🏫"
                    showChevron
                    isLast
                />
            </Section>

            <Section title="Science Department">
                <ListItem
                    title="Dr. Robert Wilson"
                    subtitle="Mathematics, Physics"
                    icon="👨‍🔬"
                    showChevron
                />
                <ListItem
                    title="Mrs. Emily White"
                    subtitle="Chemistry, Biology"
                    icon="👩‍🔬"
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminTeachers;
