import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingBag,
  BookOpen,
  Briefcase,
  Users,
  Palette,
  Sparkles,
} from "lucide-react";

import { artworkService } from "../../services/artworkService";
import { courseService } from "../../services/courseService";

function SectionTitle({ title, subtitle, to, cta }) {
  return (
    <div className="flex items-center justify-between mb-10">
      <div>
        <h2 className="text-3xl font-bold text-stone-900 mb-2">{title}</h2>
        <p className="text-stone-600">{subtitle}</p>
      </div>
      {to ? (
        <Link to={to} className="hidden sm:inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-stone-50">
          {cta || "View all"} <ArrowRight className="w-4 h-4" />
        </Link>
      ) : null}
    </div>
  );
}

function ArtworkMiniCard({ artwork }) {
  return (
    <Link
      to={`/artworks/${artwork._id || artwork.id}`}
      className="group block rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition"
    >
      <div className="aspect-[4/3] bg-stone-100">
        {artwork.imageUrl || artwork.image ? (
          <img
            src={artwork.imageUrl || artwork.image}
            alt={artwork.title || "Artwork"}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <div className="font-semibold text-stone-900 group-hover:text-amber-700 transition">
          {artwork.title || "Untitled"}
        </div>
        <div className="text-sm text-stone-600 mt-1">
          {artwork.artistName || artwork.artist?.name || "Unknown artist"}
        </div>
        {artwork.price != null ? (
          <div className="mt-3 text-sm font-medium text-stone-900">
            R {Number(artwork.price).toFixed(2)}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function CourseMiniCard({ course }) {
  return (
    <Link
      to={`/courses/${course._id || course.id}`}
      className="group block rounded-2xl border bg-white p-5 hover:shadow-lg transition"
    >
      <div className="text-sm text-stone-600">Course</div>
      <div className="mt-2 font-semibold text-stone-900 group-hover:text-amber-700 transition">
        {course.title || "Untitled course"}
      </div>
      <div className="mt-2 text-sm text-stone-600 line-clamp-2">
        {course.description || "Learn new techniques and level up your art."}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
        View details <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: featuredArtworks = [] } = useQuery({
    queryKey: ["featured-artworks"],
    queryFn: async () => {
      // adjust params if your backend uses different names
      const res = await artworkService.list({ featured: true, available: true, limit: 4, sort: "-createdAt" });
      return res?.items || res?.artworks || res || [];
    },
  });

  const { data: popularCourses = [] } = useQuery({
    queryKey: ["popular-courses"],
    queryFn: async () => {
      const res = await courseService.list({ published: true, limit: 4, sort: "-studentsCount" });
      return res?.items || res?.courses || res || [];
    },
  });

  const features = [
    {
      icon: ShoppingBag,
      title: "Art Marketplace",
      description: "Buy and sell original artwork from talented artists worldwide",
      to: "/marketplace",
      color: "bg-rose-50 text-rose-600",
    },
    {
      icon: BookOpen,
      title: "Learn & Grow",
      description: "Master new techniques with courses from professional artists",
      to: "/courses",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Briefcase,
      title: "Creative Services",
      description: "Commission custom artwork or offer your creative skills",
      to: "/marketplace",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Users,
      title: "Artist Community",
      description: "Connect, collaborate, and grow with fellow artists",
      to: "/messages",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const steps = [
    { number: "01", title: "Create Your Profile", description: "Set up your artist profile and showcase your style" },
    { number: "02", title: "Share Your Work", description: "Upload artwork, create courses, or offer services" },
    { number: "03", title: "Connect & Earn", description: "Build your audience and turn passion into income" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                The Complete Art Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight mb-6"
            >
              Where Art Meets
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-stone-900">
                Opportunity
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto"
            >
              Create, learn, sell, and connect. One platform for artists to build their careers and art lovers to discover
              extraordinary work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/marketplace" className="inline-flex">
                <button className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-14 text-lg rounded-xl inline-flex items-center">
                  Explore Art <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>

              <Link to="/register" className="inline-flex">
                <button className="h-14 text-lg rounded-xl border-2 px-8 hover:bg-white inline-flex items-center">
                  Start Selling
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">A complete ecosystem designed to help artists thrive</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={feature.to}
                    className="group block p-8 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-xl transition-all duration-300 bg-white h-full"
                  >
                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">{feature.title}</h3>
                    <p className="text-stone-600 mb-4">{feature.description}</p>
                    <span className="inline-flex items-center text-sm font-medium text-stone-900 group-hover:text-amber-700">
                      Learn more <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Artwork */}
      {featuredArtworks?.length > 0 ? (
        <section className="py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Featured Artwork"
              subtitle="Curated pieces from exceptional artists"
              to="/marketplace"
              cta="View All"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArtworks.slice(0, 4).map((artwork) => (
                <ArtworkMiniCard key={artwork._id || artwork.id} artwork={artwork} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* How It Works */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto">
              Join thousands of artists already building their creative careers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-stone-800 mb-4">{step.number}</div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-stone-400">{step.description}</p>

                {index < steps.length - 1 ? (
                  <div className="hidden md:block absolute top-10 right-0 w-1/2 h-px bg-gradient-to-r from-stone-700 to-transparent" />
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      {popularCourses?.length > 0 ? (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Popular Courses"
              subtitle="Learn from the best in the industry"
              to="/courses"
              cta="All Courses"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCourses.slice(0, 4).map((course) => (
                <CourseMiniCard key={course._id || course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Palette className="w-16 h-16 text-amber-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Ready to Start Your Art Journey?</h2>
            <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
              Create your free account and start exploring, learning, and selling today.
            </p>
            <Link to="/register" className="inline-flex">
              <button className="bg-stone-900 hover:bg-stone-800 text-white px-10 h-14 text-lg rounded-xl inline-flex items-center">
                Join Free Today <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
