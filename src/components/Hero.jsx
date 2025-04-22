import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();

  const handleStartSquat = () => navigate('/squat');
  const handleStartPushup = () => navigate('/push');

  return (
    <section className="relative min-h-screen bg-[#F5F5F5] flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row w-full px-4 sm:px-8 py-12">
        {/* Text Section */}
        <div className="flex-1 flex flex-col justify-center z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-4 leading-tight">
            Perfect your form
            <span className="block text-primary-600 font-bold">with AI guidance</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mb-8">
            Get real-time feedback on your exercise form using advanced AI technology. Choose an exercise to start training with perfect form.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-sm sm:max-w-none">
            <button
              onClick={handleStartSquat}
              className="w-full sm:w-auto px-8 py-3 rounded-md font-semibold text-white bg-primary-600 hover:bg-[#A0A0A0] transition-colors duration-200"
            >
              Start Squats
            </button>
            <button
              onClick={handleStartPushup}
              className="w-full sm:w-auto px-8 py-3 rounded-md font-semibold text-white bg-primary-600 hover:bg-[#A0A0A0] transition-colors duration-200"
            >
              Start Push-ups
            </button>
          </div>
        </div>
        {/* Image Section */}
        <div className="flex-1 mt-10 lg:mt-0 lg:ml-12 flex items-center justify-center">
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white/70">
            <img
              className="w-full h-full object-cover object-center"
              src="https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg"
              alt="Person working out"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
