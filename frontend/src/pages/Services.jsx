// src/pages/Services.jsx
import { motion } from 'framer-motion';
import {
    Palette,
    Cpu,
    Image as ImageIcon,
    Globe,
    BarChart,
    ShoppingCart,
    Shield,
    Zap,
    CheckCircle
} from 'lucide-react';

const Services = () => {
    const services = [
        {
            icon: <Palette className="w-12 h-12" />,
            title: "Custom Art Commissions",
            description: "Commission unique artworks from professional artists tailored to your vision.",
            price: "Starting at $199",
            features: ["Concept sketches", "Unlimited revisions", "High-resolution files", "Commercial license"],
            popular: true
        },
        {
            icon: <Cpu className="w-12 h-12" />,
            title: "AI Art Generation",
            description: "Generate unique AI artworks using advanced models. Perfect for NFTs and digital projects.",
            price: "From $49/month",
            features: ["1000+ AI models", "Custom training", "Batch generation", "API access"],
            popular: false
        },
        {
            icon: <ImageIcon className="w-12 h-12" />,
            title: "NFT Minting Service",
            description: "Turn your artworks into NFTs with our full-service minting platform.",
            price: "5% service fee",
            features: ["Multi-chain support", "Gas optimization", "Metadata hosting", "Marketplace listing"],
            popular: true
        },
        {
            icon: <Globe className="w-12 h-12" />,
            title: "Portfolio Websites",
            description: "Professional artist portfolio websites with integrated marketplace.",
            price: "From $299",
            features: ["Custom design", "Mobile responsive", "SEO optimized", "Analytics dashboard"],
            popular: false
        },
        {
            icon: <BarChart className="w-12 h-12" />,
            title: "Art Marketing",
            description: "Promote your artwork to our community of collectors and galleries.",
            price: "15% commission",
            features: ["Social media promotion", "Email campaigns", "Gallery placement", "Sales analytics"],
            popular: false
        },
        {
            icon: <ShoppingCart className="w-12 h-12" />,
            title: "Print & Merchandise",
            description: "Turn digital art into physical products: prints, apparel, and more.",
            price: "Production cost + 20%",
            features: ["Premium printing", "Worldwide shipping", "Quality control", "Inventory management"],
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl font-bold mb-6">Professional Art Services</h1>
                    <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-8">
                        Everything artists need to succeed - from creation tools to marketing and sales.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="btn-primary">Book a Consultation</button>
                        <button className="btn-secondary">View Pricing Plans</button>
                    </div>
                </motion.div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-dark-800/50 border rounded-2xl p-6 relative overflow-hidden group ${service.popular
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                    : 'border-dark-700 hover:border-purple-500'
                                }`}
                        >
                            {service.popular && (
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-lg">
                                    Popular
                                </div>
                            )}

                            <div className="text-purple-400 mb-4">{service.icon}</div>
                            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                            <p className="text-gray-300 mb-4">{service.description}</p>

                            <div className="text-xl font-semibold text-purple-300 mb-4">
                                {service.price}
                            </div>

                            <ul className="space-y-2 mb-6">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-400">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 rounded-lg font-semibold transition group-hover:scale-105">
                                Get Started
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Section */}
                <div className="glass-effect rounded-2xl p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <Shield className="w-16 h-16 text-green-400" />
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Trust & Security</h3>
                                <p className="text-gray-300">All transactions secured with blockchain technology</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold">100%</div>
                                <div className="text-gray-400">Secure Payments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold">24/7</div>
                                <div className="text-gray-400">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <div className="inline-block p-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-8">
                        <div className="bg-dark-900 rounded-xl p-8">
                            <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
                            <p className="text-gray-300 mb-6 max-w-2xl">
                                Contact our team for bespoke art services tailored to your specific needs.
                            </p>
                            <button className="btn-primary px-8 py-4 text-lg">
                                Contact Sales Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;