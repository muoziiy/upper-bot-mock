import React from 'react';
import { X, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    supportInfo: {
        admin_profile_link?: string;
        admin_phone?: string;
        working_hours?: string;
        <h2 className = "text-lg font-bold text-tg-text">Support & Center Info</h2 >
            <button onClick={onClose} className="text-tg-hint hover:text-tg-text transition-colors">
                <X size={24} />
            </button>
                </div >

    {/* Content */ }
    < div className = "p-5 space-y-6" >
        {/* Admin Contact */ }
{
    supportInfo?.admin_profile_link && (
        <a
            href={supportInfo.admin_profile_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-tg-button/10 rounded-xl hover:bg-tg-button/20 transition-colors group"
        >
            <div className="w-10 h-10 rounded-full bg-tg-button text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Send size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-tg-text">Contact Admin</h3>
                <p className="text-xs text-tg-hint">Message via Telegram</p>
            </div>
        </a>
    )
}

<div className="space-y-4">
    {/* Phone */}
    {supportInfo?.admin_phone && (
        <div className="flex items-start gap-3">
            <Phone className="text-tg-button shrink-0 mt-1" size={20} />
            <div>
                <h4 className="text-sm font-medium text-tg-hint uppercase mb-0.5">Phone</h4>
                <a href={`tel:${supportInfo.admin_phone}`} className="text-tg-text font-semibold hover:underline">
                    {supportInfo.admin_phone}
                </a>
            </div>
        </div>
    )}

    {/* Working Hours */}
    {supportInfo?.working_hours && (
        <div className="flex items-start gap-3">
            <Clock className="text-tg-button shrink-0 mt-1" size={20} />
            <div>
                <h4 className="text-sm font-medium text-tg-hint uppercase mb-0.5">Working Hours</h4>
                <p className="text-tg-text">{supportInfo.working_hours}</p>
            </div>
        </div>
    )}

    {/* Location */}
    {(supportInfo?.location_text || supportInfo?.location_link) && (
        <div className="flex items-start gap-3">
            <MapPin className="text-tg-button shrink-0 mt-1" size={20} />
            <div>
                <h4 className="text-sm font-medium text-tg-hint uppercase mb-0.5">Location</h4>
                {supportInfo.location_text && (
                    <p className="text-tg-text mb-1">{supportInfo.location_text}</p>
                )}
                {supportInfo.location_link && (
                    <a
                        href={supportInfo.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-tg-button font-medium hover:underline"
                    >
                        View on Map
                    </a>
                )}
            </div>
        </div>
    )}
</div>

{/* Fallback if empty */ }
{
    !supportInfo && (
        <div className="text-center text-tg-hint py-4">
            No support information available.
        </div>
    )
}
                </div >

    {/* Footer */ }
    < div className = "p-4 bg-tg-secondary/30 border-t border-tg-secondary" >
        <button
            onClick={onClose}
            className="w-full py-3 bg-tg-button text-white rounded-xl font-semibold active:scale-95 transition-transform"
        >
            Close
        </button>
                </div >
            </div >
        </div >
    );
};

export default SupportModal;
