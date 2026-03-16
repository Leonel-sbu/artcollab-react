const Loader = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export default Loader
