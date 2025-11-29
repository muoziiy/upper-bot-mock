import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
    />
            </Section >

            <Section title="Analytics">
                <ListItem
                    icon="📊"
                    title="Statistics"
                    subtitle="Payments & General Stats"
                    onClick={() => navigate('/admin/stats')}
                    showChevron
                />
            </Section>

            <Section title="Tools">
                <ListItem
                    icon="⚡"
                    title="Quick Actions"
                    subtitle="Common Tasks"
                    onClick={() => navigate('/admin/actions')}
                    showChevron
                />
                <ListItem
                    icon="📚"
                    title="Subjects"
                    subtitle="Manage Subjects"
                    onClick={() => navigate('/admin/subjects')}
                    showChevron
                    isLast
                />
            </Section>
        </div >
    );
};

export default AdminDashboard;
