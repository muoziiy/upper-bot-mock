import React from 'react';
import { Card } from '../ui/Card';
import { User } from 'lucide-react';

interface TeacherInfoPreviewProps {
    teacher: {
        first_name: string;
        last_name?: string;
        photo_url?: string;
        bio?: string;
        subjects?: string[];
    };
    subjectName?: string;
}

const TeacherInfoPreview: React.FC<TeacherInfoPreviewProps> = ({ teacher, subjectName }) => {
    const fullName = `${teacher.first_name} ${teacher.last_name || ''}`.trim();
    const shortBio = teacher.bio ? 
        (teacher.bio.length > 120 ? teacher.bio.substring(0, 117) + '...' : teacher.bio) 
        : '';

    return (
        <Card className="p-4">
            <div className="flex items-start gap-3">
                {/* Teacher Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-lg font-bold overflow-hidden flex-shrink-0">
                    {teacher.photo_url ? (
                        <img
                            src={teacher.photo_url}
                            alt={fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={20} />
                    )}
                </div>

                {/* Teacher Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-tg-text mb-0.5">{fullName}</h3>
                    {subjectName && (
                        <p className="text-xs text-tg-hint mb-2">{subjectName}</p>
                    )}
                    {shortBio && (
                        <p className="text-sm text-tg-text/80 leading-relaxed line-clamp-2">
                            {shortBio}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default TeacherInfoPreview;
