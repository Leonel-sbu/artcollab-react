// src/pages/Community.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    MessageSquare,
    Heart,
    Share2,
    TrendingUp,
    Calendar,
    Plus,
    Bell,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

const Community = () => {
    const [activeTab, setActiveTab] = useState('feed')
    const [newPost, setNewPost] = useState('')
    const [posts, setPosts] = useState([
        {
            id: 1,
            user: {
                name: "Alex Turner",
                role: "Digital Artist",
                avatarColor: "from-blue-500 to-purple-500"
            },
            content: "Just finished my first generative AI collection! Using custom-trained models on ArtCollab. What do you think? 🎨",
            image: null,
            likes: 234,
            comments: 42,
            shares: 12,
            time: "2 hours ago",
            tags: ["generative", "ai", "newcollection"]
        },
        {
            id: 2,
            user: {
                name: "Maya Chen",
                role: "3D Artist",
                avatarColor: "from-purple-500 to-pink-500"
            },
            content: "Tutorial: How I create realistic materials in Blender for NFT art. Full process video in the Learn section!",
            image: true,
            likes: 189,
            comments: 31,
            shares: 8,
            time: "5 hours ago",
            tags: ["tutorial", "3d", "blender", "education"]
        }
    ])

    const handleCreatePost = () => {
        if (!newPost.trim()) {
            toast.error('Please write something first!')
            return
        }

        const newPostObj = {
            id: posts.length + 1,
            user: {
                name: "You",
                role: "Artist",
                avatarColor: "from-green-500 to-teal-500"
            },
            content: newPost,
            image: null,
            likes: 0,
            comments: 0,
            shares: 0,
            time: "Just now",
            tags: []
        }

        setPosts([newPostObj, ...posts])
        setNewPost('')
        toast.success('Post created successfully!')
    }

    const handleLikePost = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, likes: post.likes + 1 }
                : post
        ))
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Art Community</h1>
                            <p className="text-gray-300">
                                Connect, collaborate, and grow with artists worldwide
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:opacity-90 transition">
                                <Plus className="w-5 h-5" />
                                Create Post
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 border border-purple-500 text-purple-400 rounded-full hover:bg-purple-500/10 transition">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </button>
                        </div>
                    </div>

                    {/* Community Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/50 p-4 rounded-xl"
                        >
                            <div className="text-2xl font-bold">12,847</div>
                            <div className="text-gray-400">Active Artists</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800/50 p-4 rounded-xl"
                        >
                            <div className="text-2xl font-bold">3,456</div>
                            <div className="text-gray-400">Collaborations</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-800/50 p-4 rounded-xl"
                        >
                            <div className="text-2xl font-bold">892</div>
                            <div className="text-gray-400">Groups</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-800/50 p-4 rounded-xl"
                        >
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-gray-400">Live Chat</div>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-800/50 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full" />
                                <input
                                    type="text"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="What's on your mind, artist?"
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition">
                                    <ImageIcon className="w-4 h-4" /> Photo/Video
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition">
                                    <TrendingUp className="w-4 h-4" /> Artwork
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 py-2 rounded-lg transition"
                                >
                                    Post
                                </button>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            {['feed', 'trending', 'groups', 'events'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 font-medium capitalize transition ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        <div className="space-y-6">
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-800/50 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${post.user.avatarColor} rounded-full`} />
                                            <div>
                                                <div className="font-semibold">{post.user.name}</div>
                                                <div className="text-sm text-gray-400">{post.user.role} • {post.time}</div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-white">⋯</button>
                                    </div>

                                    <p className="mb-4">{post.content}</p>

                                    {post.image && (
                                        <div className="mb-4">
                                            <div className="h-64 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg" />
                                        </div>
                                    )}

                                    <div className="flex gap-2 mb-4">
                                        {post.tags.map((tag) => (
                                            <span key={tag} className="bg-gray-900 px-3 py-1 rounded-full text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <button
                                            onClick={() => handleLikePost(post.id)}
                                            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
                                        >
                                            <Heart className="w-5 h-5" /> {post.likes}
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
                                            <MessageSquare className="w-5 h-5" /> {post.comments} comments
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition">
                                            <Share2 className="w-5 h-5" /> Share
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Artists */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">Trending Artists</h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Sarah Chen", specialty: "Digital Painting", followers: "12.5k" },
                                    { name: "Alex Rivera", specialty: "3D Animation", followers: "8.7k" },
                                    { name: "Maya Patel", specialty: "AI Art", followers: "15.2k" },
                                    { name: "Jordan Lee", specialty: "Abstract Art", followers: "6.3k" }
                                ].map((artist, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                                            <div>
                                                <div className="font-medium">{artist.name}</div>
                                                <div className="text-sm text-gray-400">{artist.specialty}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{artist.followers}</div>
                                            <div className="text-sm text-gray-400">followers</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming Events */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-800/50 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Upcoming Events</h3>
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Virtual Gallery Opening",
                                        date: "Mar 15, 2024",
                                        time: "7:00 PM EST",
                                        host: "ArtCollab Team",
                                        participants: 128
                                    },
                                    {
                                        title: "AI Art Workshop",
                                        date: "Mar 18, 2024",
                                        time: "3:00 PM EST",
                                        host: "Dr. Maya Patel",
                                        participants: 89
                                    },
                                    {
                                        title: "Community Critique Session",
                                        date: "Mar 20, 2024",
                                        time: "6:00 PM EST",
                                        host: "Alex Rivera",
                                        participants: 45
                                    }
                                ].map((event, index) => (
                                    <div key={index} className="border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition">
                                        <div className="font-semibold mb-1">{event.title}</div>
                                        <div className="text-sm text-gray-400 mb-2">{event.date} • {event.time}</div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Host: {event.host}</span>
                                            <span className="text-blue-400">{event.participants} going</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Community Guidelines */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-800/50 rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4">Community Guidelines</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>Be respectful to all members</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>Share constructive feedback</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>Credit original artists</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>No spam or self-promotion</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Community