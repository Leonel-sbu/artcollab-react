import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search, MoreVertical } from 'lucide-react';

const ConversationList = ({
    conversations,
    selectedId,
    onSelect,
    currentUserId
}) => {
    const formatTime = (date) => {
        if (!date) return '';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
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

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 mb-4 rounded-2xl bg-gray-800 flex items-center justify-center shadow-inner">
                    <MessageCircle className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    No conversations yet
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                    Start a conversation by messaging an artist from their profile page
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-700">
                    {conversations.map((conv) => {
                        const otherUser = conv.participants?.[0];
                        const isSelected = selectedId === conv._id;
                        const hasUnread = conv.unreadCount > 0;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => onSelect(conv._id)}
                                className={`w-full p-4 text-left transition-all duration-200 hover:bg-gray-800 ${isSelected
                                        ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50'
                                        : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar with online indicator */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(otherUser?.name)} flex items-center justify-center shadow-md`}>
                                            <span className="text-white font-bold text-sm">
                                                {getInitials(otherUser?.name)}
                                            </span>
                                        </div>
                                        {/* Online indicator */}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-semibold truncate ${hasUnread
                                                    ? 'text-white'
                                                    : 'text-gray-300'
                                                }`}>
                                                {otherUser?.name || 'Unknown User'}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {conv.lastMessage?.sentAt && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatTime(conv.lastMessage.sentAt)}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate pr-2 ${hasUnread
                                                    ? 'text-gray-300 font-medium'
                                                    : 'text-gray-500'
                                                }`}>
                                                {conv.lastMessage?.text || 'No messages yet'}
                                            </p>

                                            {/* Unread badge */}
                                            {hasUnread && (
                                                <span className="flex-shrink-0 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-sm">
                                                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Conversation type badge */}
                                        {conv.type !== 'general' && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded-full capitalize">
                                                    {conv.type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
