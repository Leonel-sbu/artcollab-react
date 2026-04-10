// src/pages/VRStudio.jsx
import { useEffect, useState } from 'react';
import { Headphones, Move3d, Users, Video, Share2, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { listVRVideos, addVRVideo, removeVRVideo } from '../services/vrVideoService';

function EmbedPlayer({ url }) {
  // Convert YouTube/Vimeo URLs to embeds, otherwise use <video>
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return (
      <iframe
        className="w-full aspect-video rounded-xl"
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="VR Video"
      />
    );
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return (
      <iframe
        className="w-full aspect-video rounded-xl"
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        allowFullScreen
        title="VR Video"
      />
    );
  }
  return (
    <video
      src={url}
      controls
      className="w-full aspect-video rounded-xl bg-black"
    />
  );
}

const VRStudio = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', thumbnail: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listVRVideos();
        if (res?.success) {
          setVideos(res.videos || []);
          if (res.videos?.length > 0) setActiveVideo(res.videos[0]);
        }
      } catch (err) {
        console.error('Failed to load VR videos:', err);
      } finally {
        setLoadingVideos(false);
      }
    })();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error('Title and video URL are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addVRVideo(form);
      if (res?.success) {
        setVideos((prev) => [res.video, ...prev]);
        if (!activeVideo) setActiveVideo(res.video);
        setForm({ title: '', description: '', videoUrl: '', thumbnail: '' });
        setShowAddForm(false);
        toast.success('Video added');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (videoId) => {
    if (!window.confirm('Remove this video?')) return;
    try {
      await removeVRVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      if (activeVideo?._id === videoId) {
        const remaining = videos.filter((v) => v._id !== videoId);
        setActiveVideo(remaining[0] || null);
      }
      toast.success('Video removed');
    } catch (err) {
      toast.error('Failed to remove video');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-4">VR Art Studio</h1>
            <p className="text-gray-300 text-lg">
              Immerse yourself in virtual galleries. Explore, interact, and experience
              digital art like never before.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
          )}
        </div>

        {/* Admin Add Form */}
        {isAdmin && showAddForm && (
          <div className="bg-gray-800/80 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add VR Video</h3>
              <button onClick={() => setShowAddForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Abstract Gallery Tour"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Video URL * (YouTube, Vimeo, or direct)</label>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Thumbnail URL (optional)</label>
                <input
                  value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm"
                >
                  {submitting ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Player */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          {loadingVideos ? (
            <div className="aspect-video bg-gray-700/50 rounded-xl flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : activeVideo ? (
            <div>
              <EmbedPlayer url={activeVideo.videoUrl} />
              <div className="mt-4">
                <h3 className="text-xl font-bold">{activeVideo.title}</h3>
                {activeVideo.description && (
                  <p className="text-gray-400 mt-1 text-sm">{activeVideo.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Headphones className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-2xl font-bold mb-2">No VR Videos Yet</h3>
                <p className="text-gray-400">
                  {isAdmin ? 'Add the first VR video above.' : 'Check back soon for immersive VR experiences.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video List */}
        {videos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">All VR Experiences</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((v) => (
                <div
                  key={v._id}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${activeVideo?._id === v._id ? 'border-indigo-500' : 'border-transparent hover:border-gray-600'}`}
                  onClick={() => setActiveVideo(v)}
                >
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center">
                      <Video className="w-8 h-8 text-indigo-400" />
                    </div>
                  )}
                  <div className="p-3 bg-gray-800">
                    <p className="text-sm font-medium truncate">{v.title}</p>
                    <p className="text-xs text-gray-500">by {v.addedBy?.name || 'Admin'}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(v._id); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <Move3d className="w-12 h-12 mb-4 text-blue-400" />
            <h3 className="text-2xl font-bold mb-3">VR Creation Tools</h3>
            <p className="text-gray-400">Create 3D artworks using virtual reality tools.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <Users className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-2xl font-bold mb-3">Multiplayer Tours</h3>
            <p className="text-gray-400">Visit galleries with friends in real-time.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <Share2 className="w-12 h-12 mb-4 text-green-400" />
            <h3 className="text-2xl font-bold mb-3">Live Exhibitions</h3>
            <p className="text-gray-400">Attend live virtual art exhibitions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRStudio;
