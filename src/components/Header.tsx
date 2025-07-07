export default function Header() {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
              GitGuide
            </h1>
          </div>
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
              Dashboard
            </a>
            <a href="#" className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
              Projects
            </a>
            <a href="#" className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
              Profile
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
} 