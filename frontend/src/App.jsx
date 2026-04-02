// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Scroll components
import ScrollToTop from "./components/shared/ScrollToTop";
import ScrollRestoration from "./components/shared/ScrollRestoration";

// Pages
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import VRStudio from "./pages/VRStudio";
import Learn from "./pages/Learn";
import Services from "./pages/Services";
import Community from "./pages/Community";
import UploadArtwork from "./pages/UploadArtwork";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import MessagesPage from "./pages/MessagesPage";
import ArtworkDetail from "./pages/ArtworkDetail";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Main App component with responsive Tailwind layout
 * - Full viewport height, scrollable content area
 * - Dark theme (slate-950 background)
 * - Accessibility: prefers-reduced-motion support
 */
export default function App() {
    return (
        // Main container: full viewport, scrollable content
        // Uses Tailwind slate color palette for dark theme consistency
        <div className="min-h-screen flex flex-col overflow-y-auto bg-slate-950 text-white">
            <BrowserRouter>
                <ScrollRestoration />

                {/* Toast notifications - dark themed */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#0f172a",
                            color: "#fff",
                            border: "1px solid #334155",
                        },
                    }}
                />

                {/* Route definitions */}
                <Routes>
                    {/* Home page - full width centered */}
                    <Route path="/" element={<Home />} />

                    {/* Protected routes with MainLayout (navbar + footer) */}
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/marketplace" element={
                            <ProtectedRoute><Marketplace /></ProtectedRoute>
                        } />
                        <Route path="/vr-studio" element={<VRStudio />} />
                        <Route path="/learn" element={
                            <ProtectedRoute><Learn /></ProtectedRoute>
                        } />
                        <Route path="/services" element={
                            <ProtectedRoute><Services /></ProtectedRoute>
                        } />
                        <Route path="/community" element={
                            <ProtectedRoute><Community /></ProtectedRoute>
                        } />
                        <Route path="/upload" element={
                            <ProtectedRoute><UploadArtwork /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        <Route path="/cart" element={
                            <ProtectedRoute><Cart /></ProtectedRoute>
                        } />
                        <Route path="/messages" element={
                            <ProtectedRoute><MessagesPage /></ProtectedRoute>
                        } />
                        <Route path="/messages/:conversationId" element={
                            <ProtectedRoute><MessagesPage /></ProtectedRoute>
                        } />
                        <Route path="/artwork/:id" element={
                            <ProtectedRoute><ArtworkDetail /></ProtectedRoute>
                        } />
                    </Route>

                    {/* Auth routes with AuthLayout */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>

            {/* Scroll to top button */}
            <ScrollToTop />
        </div>
    );
}
