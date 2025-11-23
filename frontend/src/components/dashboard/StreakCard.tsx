import React from 'react';
import { Card } from '../ui/Card';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
}

const StreakCard: React.FC<StreakCardProps> = ({
    currentStreak,
    longestStreak,
    totalActiveDays
}) => {
    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500"
                    >
                        <Flame className="h-8 w-8 text-white" />
                    </motion.div>

                    <div>
                        <p className="text-xs text-tg-hint">Current Streak</p>
                        <p className="text-3xl font-bold">
                            {currentStreak} <span className="text-lg">days</span>
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm font-medium">{longestStreak} days</p>
                    </div>
                    <p className="text-xs text-tg-hint">Longest Streak</p>
                    <p className="text-xs text-tg-hint mt-2">{totalActiveDays} total days</p>
                </div>
            </div>

            {currentStreak > 0 && (
                <div className="mt-3 flex items-center gap-1">
                    <div className="h-1 flex-1 rounded-full bg-tg-hint/20 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                        />
                    </div>
                </div>
            )}

            {currentStreak === 0 && (
                <p className="mt-3 text-center text-sm text-tg-hint">
                    Start your streak today! 🚀
                </p>
            )}
        </Card>
    );
};

export default StreakCard;
