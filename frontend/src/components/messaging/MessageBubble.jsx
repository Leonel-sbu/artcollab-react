import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
    const { sender, text, attachment, status, createdAt } = message;

    const formatTime = (date) => {
        if (!date) return '';
        return format(new Date(date), 'h:mm a');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            'from-rose-500 to-pink-500',
            'from-orange-500 to-amber-500',
            'from-emerald-500 to-teal-500',
            'from-cyan-500 to-blue-500',
            'from-indigo-500 to-violet-500',
            'from-purple-500 to-fuchsia-500',
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const renderStatus = () => {
        if (!isOwn || !status) return null;

        if (status === 'read') {
            return (
                <span className="text-xs text-blue-300 flex items-center gap-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
            );
        }

        if (status === 'delivered') {
            return (
                <span className="text-xs text-indigo-300 flex items-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <svg className="w-4 h-4 -ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </span>
            );
        }

        return <span className="text-xs text-indigo-300">✓</span>;
    };

    return (
        <div className={`flex gap-3 mb-4 animate-fade-in ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {!isOwn && showAvatar && (
                <div className="flex-shrink-0 self-end">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(sender?.name)} flex items-center justify-center shadow-md`}>
                        <span className="text-white text-xs font-bold">
                            {getInitials(sender?.name)}
                        </span>
                    </div>
                </div>
            )}

            {/* Message bubble */}
            <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isOwn && (
                    <span className="text-xs text-gray-400 mb-1.5 ml-1 font-medium">
                        {sender?.name || 'Unknown'}
                    </span>
                )}

                <div
                    className={`relative px-4 py-3 rounded-2xl shadow-sm ${isOwn
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
                        }`}
                >
                    {/* Attachment */}
                    {attachment?.hasAttachment && (
                        <div className="mb-3">
                            {attachment.type === 'image' ? (
                                <div className="relative">
                                    <img
                                        src={attachment.url}
                                        alt={attachment.filename}
                                        className="max-w-full rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                                    />
                                </div>
                            ) : (
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isOwn
                                            ? 'bg-white/10 hover:bg-white/20'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-indigo-900'}`}>
                                        <svg className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-200'}`}>
                                            {attachment.filename}
                                        </p>
                                        <p className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            Click to download
                                        </p>
                                    </div>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Text */}
                    {text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                    )}

                    {/* Time and status */}
                    <div className={`flex items-center justify-end gap-1.5 mt-2 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                        <span className="text-xs opacity-80">
                            {formatTime(createdAt)}
                        </span>
                        {renderStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
