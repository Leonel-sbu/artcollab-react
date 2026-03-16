// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

/**
 * MainLayout - Main app shell with Navbar and Footer
 * Uses consistent surface colors for dark theme
 */
const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-surface-950">
            <Navbar />
            <main className="flex-grow pt-16 min-h-[calc(100vh-200px)]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;