// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

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
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        /* Dark theme - surface colors applied consistently */
        <div className="min-h-screen bg-surface-950 text-white transition-colors duration-300">
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#0f172a",
                            color: "#fff",
                            border: "1px solid #1e293b",
                        },
                    }}
                />

                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/vr-studio" element={<VRStudio />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/community" element={<Community />} />
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
                    </Route>

                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                        />
                    </Route>

                    {/* Admin Routes - Note: Admin registration is disabled for security. Admin accounts must be created via backend seed script. */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    {/* Removed /admin/register route - admins must be seeded */}
                    <Route path="/admin/dashboard" element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
