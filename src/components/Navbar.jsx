import React from 'react';
import { Activity, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll'; // Import react-scroll's Link component

function Navbar({ onBack }) {
  const navigate = useNavigate(); // Hook to navigate to different routes

  const handleGoHome = () => {
    navigate('/'); // Redirects to the home page
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {onBack && (
              <button onClick={onBack} className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft size={24} />
              </button>
            )}
            {/* Redirect to home page when the logo is clicked */}
            <button onClick={handleGoHome} className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Exercise Trainer</span>
            </button>
          </div>
          <div className="flex items-center">
            {/* Scroll to Hero section with smooth transition */}
            <Link 
              to="hero-section" 
              smooth={true} 
              duration={500} // Duration of the scroll in milliseconds
              className="mr-4 text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer"
            >
              <Home size={24} />
            </Link>
            <a href="https://github.com/yourusername/ai-exercise-trainer" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 px-3 py-2">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
