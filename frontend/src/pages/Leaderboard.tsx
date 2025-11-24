import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const Leaderboard: React.FC = () => {
    const { leaderboardData, loading } = useAppData();
    const [category, setCategory] = useState('global');

    const leaderboard = leaderboardData?.leaderboard || [];
    const userRank = leaderboardData?.user_rank;

    const topThree = leaderboard.slice(0, 3);
    const restOfList = leaderboard.slice(3);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text overflow-hidden">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="px-4"
            >
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                    <p className="text-sm text-tg-hint">Compete with your peers</p>
                </header>

                <div className="mb-8 flex justify-center gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCategory(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === tab.id
                                ? 'bg-tg-button text-tg-button-text shadow-md'
                                : 'bg-tg-bg text-tg-hint hover:bg-tg-bg/80'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Podium */}
                {topThree.length > 0 && (
                    <div className="mb-8 flex items-end justify-center gap-4 h-48">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3 z-10">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 p-0.5 shadow-lg">
                                        <div className="w-full h-full rounded-full bg-tg-secondary flex items-center justify-center border-2 border-white/10">
                                            <span className="text-xl font-bold text-tg-text">
                                                {topThree[1].users.first_name[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        #2
                                    </div>
                                </div>
                                <p className="font-semibold text-sm truncate w-full text-center">{topThree[1].users.first_name}</p>
                                <p className="text-xs text-tg-hint font-medium">{topThree[1].score}</p>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3 z-20 -mb-2">
                                <div className="relative mb-2">
                                    <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-sm" />
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 p-0.5 shadow-xl shadow-yellow-500/20">
                                        <div className="w-full h-full rounded-full bg-tg-secondary flex items-center justify-center border-2 border-white/10">
                                            <span className="text-2xl font-bold text-tg-text">
                                                {topThree[0].users.first_name[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                                        #1
                                    </div>
                                </div>
                                <p className="font-bold text-base truncate w-full text-center">{topThree[0].users.first_name}</p>
                                <p className="text-xs text-yellow-500 font-bold">{topThree[0].score}</p>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center w-1/3 z-10">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 p-0.5 shadow-lg">
                                        <div className="w-full h-full rounded-full bg-tg-secondary flex items-center justify-center border-2 border-white/10">
                                            <span className="text-xl font-bold text-tg-text">
                                                {topThree[2].users.first_name[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        #3
                                    </div>
                                </div>
                                <p className="font-semibold text-sm truncate w-full text-center">{topThree[2].users.first_name}</p>
                                <p className="text-xs text-tg-hint font-medium">{topThree[2].score}</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* List */}
                <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                    {restOfList.map((entry: any, index: number) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`flex items-center justify-between p-4 border-b border-tg-secondary/50 last:border-none ${entry.rank === userRank?.rank ? 'bg-tg-button/5' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-tg-hint w-6 text-center">{entry.rank}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-tg-secondary flex items-center justify-center text-xs font-bold">
                                        {entry.users.first_name[0]}
                                    </div>
                                    <p className="font-medium text-sm">{entry.users.first_name}</p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-tg-text">{entry.score}</span>
                        </motion.div>
                    ))}
                </div>

                {/* User Rank Sticky Footer (if not in top view) */}
                {userRank && userRank.rank > 3 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-20 left-4 right-4"
                    >
                        <div className="bg-tg-button text-tg-button-text rounded-xl p-4 shadow-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold w-6 text-center">#{userRank.rank}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                        U
                                    </div>
                                    <p className="font-medium text-sm">You</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold">{userRank.score}</span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Leaderboard;
