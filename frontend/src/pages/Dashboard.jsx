import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../services/dashboardService";

import backgroundImage from "../assets/images/images-10.jpg";

function formatZAR(amount) {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return "R " + n.toFixed(2);
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalSalesZAR: 0,
    totalOrders: 0,
    followers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getDashboardStats();

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load dashboard stats");
      }

      setStats(res.data || {});
    } catch (e) {
      console.error('Dashboard load error:', e);
      // Provide more specific error messages based on error type
      if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setError("Unable to connect to server. Please check your connection.");
      } else if (e.response?.status === 401) {
        setError("Please log in to view your dashboard.");
      } else if (e.response?.status === 403) {
        setError("Access denied.");
      } else {
        setError(e?.message || "Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Total Artworks",
        value: String(stats.totalArtworks ?? 0),
        change: "Live from your account",
        color: "text-primary",
      },
      {
        title: "Total Sales",
        value: formatZAR(stats.totalSalesZAR),
        subValue: `${stats.totalOrders ?? 0} paid orders`,
        color: "text-secondary",
      },
      {
        title: "Followers",
        value: String(stats.followers ?? 0),
        change: "Live from your profile",
        color: "text-accent",
      },
    ],
    [stats]
  );

  const features = [
    {
      title: "Art Marketplace",
      description: "Buy and sell original artwork from talented artists worldwide",
      link: "/marketplace",
    },
    {
      title: "Learn & Grow",
      description: "Master new techniques with courses from professional artists",
      link: "/learn",
    },
    {
      title: "Creative Services",
      description: "Commission custom artwork or offer your creative skills",
      link: "/services",
    },
    {
      title: "Artist Community",
      description: "Connect, collaborate, and grow with fellow artists",
      link: "/community",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Set up your artist profile and showcase your style",
    },
    {
      number: "02",
      title: "Share Your Work",
      description: "Upload artwork, create courses, or offer services",
    },
    {
      number: "03",
      title: "Connect & Earn",
      description: "Build your audience and turn passion into income",
    },
  ];

  return (
    <div className="relative flex-1 overflow-y-auto">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Welcome */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome to ArtCollab, {user?.name || user?.displayName || "Artist"}
            </h1>
            <p className="text-lg text-gray-300">
              Your creative journey continues here
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="max-w-3xl mx-auto mb-10 bg-gray-900/70 border border-gray-700/50 rounded-2xl p-5 text-gray-200 text-center">
              Loading dashboard stats...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-3xl mx-auto mb-10 bg-red-500/10 border border-red-500/60 rounded-2xl p-5 text-red-200 text-center">
              {error}{" "}
              <button
                className="ml-2 underline"
                onClick={loadStats}
                type="button"
              >
                Try again
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {cards.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:border-primary/50 transition"
              >
                <h3 className="text-gray-300 mb-2">{stat.title}</h3>
                <p className={`text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-gray-400 text-sm">{stat.subValue}</p>
                )}
                {stat.change && (
                  <p className="text-green-400 text-sm mt-2">{stat.change}</p>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-10">
              Everything You Need
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:border-primary/50 transition"
                >
                  <h3 className="text-white font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="text-primary font-medium hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-10">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-extrabold text-primary/40 mb-3">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
