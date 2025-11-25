import React from 'react';
import { Card } from '../ui/Card';
import { User, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherInfoPreviewProps {
    teacher: {
        first_name: string;
        last_name?: string;
        photo_url?: string;
        bio?: string;
        subjects?: string[];
    };
    subjectName?: string;
    subjectColor?: string;
}

const TeacherInfoPreview: React.FC<TeacherInfoPreviewProps> = ({
    teacher,
    subjectName,
    subjectColor = '#3390EC'
}) => {
    const fullName = `${teacher.first_name} ${teacher.last_name || ''}`.trim();
    const shortBio = teacher.bio ?
        (teacher.bio.length > 100 ? teacher.bio.substring(0, 97) + '...' : teacher.bio)
        : '';

    // Mock rating - in real app this would come from data
    const rating = 4.8;

    return (
        <Card className="p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5"
                style={{ backgroundColor: subjectColor }}
            />

            <div className="flex items-start gap-3 relative z-10">
                {/* Teacher Avatar */}
                <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {teacher.photo_url ? (
                        <img
                            src={teacher.photo_url}
                            alt={fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={28} />
                    )}
                </motion.div>

                {/* Teacher Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-base text-tg-text">
                            {fullName}
                        </h3>
                        {/* Rating */}
                        <div className="flex items-center gap-1 flex-shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                {rating}
                            </span>
                        </div>
                    </div>

                    {subjectName && (
                        <p
                            className="text-xs font-medium mb-2"
                            style={{ color: subjectColor }}
                        >
                            {subjectName} Teacher
                        </p>
                    )}

                    {shortBio && (
                        <p className="text-xs text-tg-hint leading-relaxed">
                            {shortBio}
                        </p>
                    )}

                    {teacher.subjects && teacher.subjects.length > 1 && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="text-[10px] text-tg-hint">
                                +{teacher.subjects.length - 1} more subject{teacher.subjects.length > 2 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default TeacherInfoPreview;
