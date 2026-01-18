const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <span className="text-2xl font-bold text-white">ArtCollab</span>
                        </div>
                        <p className="text-gray-400 mb-6">
                            The future of digital art creation, exhibition, and collection in virtual reality.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Platform</h3>
                        <ul className="space-y-3">
                            <li><a href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</a></li>
                            <li><a href="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
                            <li><a href="/vr-gallery" className="text-gray-400 hover:text-white transition-colors">VR Gallery</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Resources</h3>
                        <ul className="space-y-3">
                            <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                            <li><a href="/support" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <p className="text-gray-400">
                        {currentYear} ArtCollab. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        This is a real application. All artwork and user data is fictional.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
