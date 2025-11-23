import React, { useEffect, useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import BottomNav from '../components/BottomNav';
import { motion } from 'framer-motion';
import { Trophy, Clock, ChevronRight } from 'lucide-react';

const StudentDashboard: React.FC = () => {
    const { user } = useTelegram();
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        // Fetch exams
        const fetchExams = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/students/exams`, {
                        headers: { 'x-user-id': user.id.toString() }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setExams(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch exams", e);
                }
            }
        };
        fetchExams();
    }, [user]);

    return (
        <div className="min-h-screen bg-tg-bg pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">Hello, {user?.first_name} 👋</h1>
                    <p className="text-tg-hint">Ready to learn something new today?</p>
                </header>

                <Section title="Your Stats">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="flex flex-col items-center justify-center p-4">
                            <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
                            <span className="text-2xl font-bold">1,250</span>
                            <span className="text-xs text-tg-hint">Total Points</span>
                        </Card>
                        <Card className="flex flex-col items-center justify-center p-4">
                            <Clock className="mb-2 h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold">12</span>
                            <span className="text-xs text-tg-hint">Exams Taken</span>
                        </Card>
                    </div>
                </Section>

                <Section title="Available Exams" action={<Button variant="ghost" size="sm">See All</Button>}>
                    {exams.length === 0 ? (
                        <Card className="flex flex-col items-center py-8 text-center">
                            <p className="text-tg-hint">No exams available right now.</p>
                            <Button variant="secondary" className="mt-4">Refresh</Button>
                        </Card>
                    ) : (
                        exams.map((exam: any) => (
                            <Card key={exam.id} className="flex items-center justify-between active:scale-[0.98] transition-transform">
                                <div>
                                    <h3 className="font-bold">{exam.title}</h3>
                                    <p className="text-sm text-tg-hint line-clamp-1">{exam.description}</p>
                                </div>
                                <Button size="sm" className="ml-4 shrink-0">
                                    Start
                                </Button>
                            </Card>
                        ))
                    )}
                </Section>

                <Section title="Recent Activity">
                    <Card>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">Mathematics Final</p>
                                    <p className="text-xs text-tg-hint">Yesterday</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-500">95%</p>
                                <ChevronRight size={16} className="ml-auto text-tg-hint" />
                            </div>
                        </div>
                    </Card>
                </Section>
            </motion.div>

            <BottomNav />
        </div>
    );
};

export default StudentDashboard;
