// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import Dashboard from './pages/Dashboard'
import VRStudio from './pages/VRStudio'
import Learn from './pages/Learn'
import Services from './pages/Services'
import Community from './pages/Community'
import UploadArtwork from './pages/UploadArtwork'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1f2937',
                            color: '#fff',
                            border: '1px solid #374151'
                        }
                    }}
                />

                <Routes>
                    {/* Home (NO navbar/footer) */}
                    <Route path="/" element={<Home />} />

                    {/* Main layout (WITH navbar/footer) */}
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/vr-studio" element={<VRStudio />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/upload" element={<UploadArtwork />} />
                    </Route>

                    {/* Auth pages (NO navbar/footer) */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App