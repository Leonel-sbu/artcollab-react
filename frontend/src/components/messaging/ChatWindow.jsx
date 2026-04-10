import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ArrowLeft, MessageCircle, Phone, Video, MoreVertical, X, Image as ImageIcon } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { uploadMessageAttachment } from '../../services/messageService';
import toast from 'react-hot-toast';

const ChatWindow = ({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    onBack,
    loading
}) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachment, setAttachment] = useState(null); // { url, filename, size, mimeType, preview }
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const otherUser = conversation?.participants?.[0];

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [conversation]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setUploading(true);
        try {
            const preview = URL.createObjectURL(file);
            const res = await uploadMessageAttachment(file);
            if (res?.success) {
                setAttachment({ url: res.url, filename: res.filename, size: res.size, mimeType: res.mimeType, preview });
            } else {
                toast.error(res?.message || 'Upload failed');
                URL.revokeObjectURL(preview);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const clearAttachment = () => {
        if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
        setAttachment(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !attachment) return;

        const attachmentPayload = attachment
            ? { hasAttachment: true, type: 'image', url: attachment.url, filename: attachment.filename, size: attachment.size, mimeType: attachment.mimeType }
            : null;

        onSendMessage(text.trim(), attachmentPayload);
        setText('');
        clearAttachment();
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center shadow-xl">
                        <MessageCircle className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Your Messages
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Select a conversation from the list to start chatting with artists and buyers
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2.5 hover:bg-gray-800 rounded-xl transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-300" />
                    </button>

                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold">
                                {getInitials(otherUser?.name)}
                            </span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-3 border-gray-900 rounded-full"></span>
                    </div>

                    <div>
                        <h2 className="font-bold text-white text-lg">
                            {otherUser?.name || 'Unknown'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-gray-400 capitalize">
                                {otherUser?.role || 'Online'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button className="p-2.5 hover:bg-gray-800 rounded-xl transition-all duration-200">
                        <Phone className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-800 rounded-xl transition-all duration-200">
                        <Video className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-800 rounded-xl transition-all duration-200">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900 to-gray-800">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-gray-700"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-800 flex items-center justify-center shadow-lg">
                            <MessageCircle className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-gray-300 font-medium mb-1">No messages yet</p>
                        <p className="text-sm text-gray-500">Send a message to start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-6">
                            <div className="px-4 py-1.5 bg-gray-800 rounded-full shadow-sm border border-gray-700">
                                <span className="text-xs text-gray-500">Today</span>
                            </div>
                        </div>

                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message._id || index}
                                message={message}
                                isOwn={message.sender?._id === currentUserId || message.sender === currentUserId}
                                showAvatar={
                                    index === 0 ||
                                    messages[index - 1]?.sender?._id !== message.sender?._id
                                }
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex gap-1 px-4 py-3 bg-gray-800 rounded-2xl rounded-tl-md">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-900">
                {/* Attachment preview */}
                {attachment && (
                    <div className="mb-3 relative inline-block">
                        <img
                            src={attachment.preview}
                            alt="Attachment"
                            className="h-20 rounded-lg object-cover border border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={clearAttachment}
                            className="absolute -top-2 -right-2 p-0.5 bg-gray-700 hover:bg-red-600 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-3 p-2 bg-gray-800 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-3 text-gray-500 hover:text-indigo-400 hover:bg-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50"
                        title="Attach image"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Paperclip size={20} />
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder-gray-500 resize-none text-sm"
                            style={{ maxHeight: '120px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!text.trim() && !attachment}
                        className={`p-3 rounded-xl transition-all duration-200 ${(text.trim() || attachment)
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Typing hint */}
                <div className="flex items-center justify-center mt-2">
                    <span className="text-xs text-gray-500">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Shift + Enter</kbd> for new line
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
