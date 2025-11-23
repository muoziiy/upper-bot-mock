import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
    const { leaderboardData, loading } = useAppData();
    const [category] = useState('global');

    const leaderboard = leaderboardData?.leaderboard || [];
    const userRank = leaderboardData?.user_rank;

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
        return <span className="text-tg-hint">#{rank}</span>;
    };

    const tabs = [
        { id: 'global', label: 'Global' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'class', label: 'Class' },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">Leaderboard 🏆</h1>
                    <p className="text-tg-hint">compete with your peers</p>
                </header>

                <div className="mb-4 flex gap-2">
                    {tabs.map(tab => (
                        <Button
                            key={tab.id}
                            variant={category === tab.id ? 'primary' : 'secondary'}
                            size="sm"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {leaderboard.length >= 3 && (
                    <div className="mb-6 grid grid-cols-3 gap-2">
                        <Card className="flex flex-col items-center p-3">
                            <Medal className="mb-2 h-8 w-8 text-gray-400" />
                            <p className="font-bold">{leaderboard[1]?.users.first_name}</p>
                            <p className="text-sm text-tg-hint">{leaderboard[1]?.score}</p>
                        </Card>
                        <Card className="flex flex-col items-center bg-gradient-to-b from-yellow-100 to-yellow-50 p-3 dark:from-yellow-900/30 dark:to-yellow-900/10">
                            <Trophy className="mb-2 h-10 w-10 text-yellow-500" />
                            <p className="font-bold text-lg">{leaderboard[0]?.users.first_name}</p>
                            <p className="text-sm text-tg-hint">{leaderboard[0]?.score}</p>
                        </Card>
                        <Card className="flex flex-col items-center p-3">
                            <Award className="mb-2 h-8 w-8 text-orange-600" />
                            <p className="font-bold">{leaderboard[2]?.users.first_name}</p>
                            <p className="text-sm text-tg-hint">{leaderboard[2]?.score}</p>
                        </Card>
                    </div>
                )}

                <div className="space-y-2">
                    {leaderboard.map((entry: any, index: number) => (
                        <Card
                            key={index}
                            className={`flex items-center justify-between ${entry.rank === userRank?.rank ? 'ring-2 ring-tg-button' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex w-12 items-center justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <div>
                                    <p className="font-bold">{entry.users.first_name}</p>
                                    <p className="text-xs text-tg-hint">{entry.score} points</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {userRank && userRank.rank > 50 && (
                    <Card className="mt-4 bg-tg-button/10">
                        <div className="flex items-center justify-between">
                            <p className="text-sm">Your Rank</p>
                            <div className="text-right">
                                <p className="font-bold">#{userRank.rank}</p>
                                <p className="text-xs text-tg-hint">{userRank.score} points</p>
                            </div>
                        </div>
                    </Card>
                )}
            </motion.div>
        </div>
    );
};

export default Leaderboard;
