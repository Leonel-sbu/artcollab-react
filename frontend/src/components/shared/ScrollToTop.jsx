// src/components/shared/ScrollToTop.jsx - Scroll to top button component
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const toggle = () => {
            // Show button when scrolled down 300px
            setVisible(window.scrollY > 300)
        }
        window.addEventListener('scroll', toggle, { passive: true })
        return () => window.removeEventListener('scroll', toggle)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    if (!visible) return null

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
            aria-label="Scroll to top"
        >
            <ChevronUp className="w-5 h-5" />
        </button>
    )
}