import React from 'react';
import { getLevelDisplayName, getLevelColor, type UserCurrentLevel } from '../../types/journey.types';
import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LevelCardProps {
    userLevel: UserCurrentLevel;
}

const LevelCard: React.FC<LevelCardProps> = ({ userLevel }) => {
    const { t } = useTranslation();
    const levelName = getLevelDisplayName(userLevel.current_level);
    const levelColor = getLevelColor(userLevel.current_level);
    const progress = userLevel.progress_percentage || 0;

    const getMotivationMessage = (prog: number) => {
        if (prog === 0) return t('dashboard.motivation_start');
        if (prog < 50) return t('dashboard.motivation_early');
        if (prog < 80) return t('dashboard.motivation_mid');
        return t('dashboard.motivation_late');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tg-button/20 to-tg-button/5 p-6 backdrop-blur-sm border border-tg-hint/10"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tg-button/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-tg-hint text-sm mb-1">{t('dashboard.current_level')}</p>
                        <h2 className="text-3xl font-bold text-tg-text flex items-center gap-2">
                            <Award size={28} style={{ color: levelColor }} />
                            {levelName}
                        </h2>
                    </div>
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
                    >
                        {progress}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-tg-hint flex items-center gap-1">
                            <TrendingUp size={14} />
                            {t('dashboard.progress_next')}
                        </span>
                        <span className="text-tg-text font-medium">{progress}%</span>
                    </div>
                    <div className="h-3 bg-tg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: levelColor }}
                        />
                    </div>
                </div>

                {progress < 100 && (
                    <p className="text-tg-hint text-sm mt-4">
                        {getMotivationMessage(progress)}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default LevelCard;
