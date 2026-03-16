import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Always use dark mode only
    const [theme] = useState('dark');

    useEffect(() => {
        // Always apply dark theme
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, [theme]);

    // Toggle function removed - always dark mode
    const toggleTheme = () => {
        // No-op - dark mode only
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: () => { }, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
