// src/pages/VRStudio.jsx
import { Headphones, Move3d, Users, Video, Share2 } from 'lucide-react'

const VRStudio = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-5xl font-bold mb-4">VR Art Studio</h1>
                    <p className="text-gray-300 text-lg">
                        Immerse yourself in virtual galleries. Explore, interact, and experience
                        digital art like never before.
                    </p>
                </div>

                {/* VR Gallery Preview */}
                <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
                    <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                            <Headphones className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                            <h3 className="text-2xl font-bold mb-2">VR Gallery Loading...</h3>
                            <p className="text-gray-400">Put on your VR headset for the full experience</p>
                        </div>
                    </div>
                </div>

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
                        <Video className="w-12 h-12 mb-4 text-green-400" />
                        <h3 className="text-2xl font-bold mb-3">Live Exhibitions</h3>
                        <p className="text-gray-400">Attend live virtual art exhibitions.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VRStudio