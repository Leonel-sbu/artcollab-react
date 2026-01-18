import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// ✅ Import images correctly
import img1 from "../assets/images/images.jpg";
import img2 from "../assets/images/download-2.jpg";
import img3 from "../assets/images/download-1.jpg";

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const backgroundImages = [
        {
            id: 1,
            title: "VR Art Gallery",
            description: "Immerse yourself in breathtaking virtual art exhibitions",
            image: img1,
            overlay:
                "bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60",
        },
        {
            id: 2,
            title: "Create Masterpieces",
            description: "Design stunning art in immersive virtual reality studios",
            image: img2,
            overlay:
                "bg-gradient-to-r from-emerald-900/60 via-teal-900/60 to-cyan-900/60",
        },
        {
            id: 3,
            title: "Digital Marketplace",
            description: "Trade unique digital artwork with blockchain technology",
            image: img3,
            overlay:
                "bg-gradient-to-r from-orange-500/50 via-red-500/50 to-rose-500/50",
        },
    ];

    const features = [
        {
            title: "VR Art Gallery",
            description:
                "Immerse yourself in breathtaking virtual art exhibitions from around the world.",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "Art Courses",
            description:
                "Learn from master artists with interactive VR tutorials and workshops.",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            title: "Digital Marketplace",
            description:
                "Buy, sell, and trade digital artwork with secure blockchain technology.",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            title: "Create in VR",
            description:
                "Use our VR tools to create stunning digital art in 3D space.",
            gradient: "from-orange-500 to-red-500",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    return (
        <div className="min-h-screen bg-black">
            {/* ================= HERO ================= */}
            <section className="relative min-h-screen overflow-hidden pt-20">
                {/* Background Carousel */}
                <div className="absolute inset-0">
                    {backgroundImages.map((item, index) => (
                        <div
                            key={item.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />
                            <div className={`absolute inset-0 ${item.overlay}`} />
                            <div className="absolute inset-0 bg-black/30" />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="relative z-20 container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                ArtCollab
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-20 container mx-auto px-4 py-32 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        {backgroundImages[currentSlide].title}
                    </h2>

                    <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                        {backgroundImages[currentSlide].description}
                    </p>

                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
                        Where Art Meets
                        <span className="block mt-2">Virtual Reality</span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                        Experience, create, and trade art in immersive virtual galleries.
                        Join thousands of artists and collectors.
                    </p>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="py-20 bg-black/90">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">
                        Why Choose{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            ArtCollab
                        </span>
                        ?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="bg-white/5 backdrop-blur p-6 rounded-2xl hover:scale-105 transition"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-6 flex items-center justify-center`}
                                >
                                    <span className="text-white font-bold">{i + 1}</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3">
                                    {f.title}
                                </h3>

                                <p className="text-gray-300">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-white/5 backdrop-blur border border-white/10">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Start Your Art Journey?
                        </h2>

                        <p className="text-xl text-gray-300 mb-10">
                            Join the largest community of digital artists and collectors.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <Link to="/register" className="btn-primary px-8 py-4 text-lg">
                                Create Free Account
                            </Link>
                            <Link to="/login" className="btn-secondary px-8 py-4 text-lg">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
