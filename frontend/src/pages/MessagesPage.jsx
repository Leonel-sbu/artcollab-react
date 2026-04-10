import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    getConversations,
    getMessages,
    sendMessage,
    getConversation
} from '../services/messageService';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';

const MessagesPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationsLoaded, setConversationsLoaded] = useState(false);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            const result = await getConversations();
            if (result.success) {
                setConversations(result.conversations || []);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                toast.error("Unable to connect to server. Please check your connection.");
            } else if (error.response?.status === 401) {
                toast.error("Please log in to view messages.");
            }
        } finally {
            setConversationsLoaded(true);
        }
    }, []);

    // Load messages for selected conversation
    const loadMessages = useCallback(async (convId) => {
        if (!convId) return;

        setLoading(true);
        try {
            const result = await getMessages(convId);
            if (result.success) {
                setMessages(result.messages || []);
                // Mark messages as read - find unread messages and mark them
                const unreadMessages = (result.messages || []).filter(
                    msg => msg.sender?._id !== user?._id && msg.status !== 'read'
                );
                // Note: In production, you'd want to batch mark as read or use a different approach
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                toast.error("Unable to connect to server. Please check your connection.");
            } else if (error.response?.status === 401) {
                toast.error("Please log in to view messages.");
            } else if (error.response?.status === 403) {
                toast.error("Access denied to this conversation.");
            }
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    // Initial load
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Load conversation if ID provided in URL - only after conversations are loaded
    useEffect(() => {
        // Don't process until conversations have loaded
        if (!conversationsLoaded) return;

        const loadConv = async () => {
            if (conversationId) {
                // Find conversation in list first
                let conv = conversations.find(c => c._id === conversationId);

                // If not found in list, fetch it directly (e.g., from booking)
                if (!conv) {
                    try {
                        const result = await getConversation(conversationId);
                        if (result.success) {
                            conv = result.conversation;
                        }
                    } catch (error) {
                        console.error('Failed to load conversation:', error);
                    }
                }

                if (conv) {
                    setSelectedConversation(conv);
                    loadMessages(conversationId);
                } else {
                    // If conversationId doesn't match any conversation, navigate back
                    navigate('/messages');
                }
            } else {
                setSelectedConversation(null);
                setMessages([]);
            }
        };

        loadConv();
    }, [conversationId, conversations, conversationsLoaded, loadMessages, navigate]);

    // Handle selecting a conversation
    const handleSelectConversation = (convId) => {
        const conv = conversations.find(c => c._id === convId);
        if (conv) {
            setSelectedConversation(conv);
            navigate(`/messages/${convId}`);
            loadMessages(convId);
        }
    };

    // Handle sending a message (text and optional attachment)
    const handleSendMessage = async (text, attachment = null) => {
        if (!selectedConversation?._id || sending) return;
        if (!text && !attachment) return;

        setSending(true);
        try {
            const result = await sendMessage(selectedConversation._id, text, attachment);
            if (result.success && result.message) {
                setMessages(prev => [...prev, result.message]);
                // Update conversation last message preview
                setConversations(prev => prev.map(c =>
                    c._id === selectedConversation._id
                        ? { ...c, lastMessage: { text: text || '📎 Image', sentAt: new Date() } }
                        : c
                ));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Handle going back (mobile)
    const handleBack = () => {
        setSelectedConversation(null);
        navigate('/messages');
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="max-w-7xl mx-auto w-full h-full flex shadow-2xl">
                {/* Conversation List */}
                <div className={`
          w-full md:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col
          ${selectedConversation ? 'hidden md:flex' : 'flex'}
        `}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            Messages
                        </h1>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?._id}
                            onSelect={handleSelectConversation}
                            currentUserId={user?._id}
                        />
                    </div>
                </div>

                {/* Chat Window */}
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    currentUserId={user?._id}
                    onSendMessage={handleSendMessage}
                    onBack={handleBack}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default MessagesPage;
