import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '../../services/messageService';

const MessageArtistButton = ({ artistId, artistName, artworkId = null, className = '' }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleMessage = async () => {
        if (!artistId) return;

        setLoading(true);
        try {
            const linkedResource = artworkId ? {
                resourceType: 'artwork',
                resourceId: artworkId,
            } : null;

            const result = await createConversation(artistId, artworkId ? 'artwork' : 'general', linkedResource);

            if (result.success && result.conversation?._id) {
                navigate(`/messages/${result.conversation._id}`);
            }
        } catch (error) {
            console.error('Failed to start conversation:', error);
            navigate('/messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleMessage}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        >
            <MessageCircle size={18} />
            {loading ? 'Opening...' : `Message ${artistName || 'Artist'}`}
        </button>
    );
};

export default MessageArtistButton;
