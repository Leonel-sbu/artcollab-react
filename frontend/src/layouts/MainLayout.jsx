// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <main className="pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default MainLayout