// Simple inline loader that doesn't block scrolling
const InlineLoader = () => {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    )
}

export default InlineLoader