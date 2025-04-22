import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PoseDetector from './components/pose/PoseDetector';
import Footer from './components/Footer';
import PushupDetector from './components/pose/PushupDetector';
import Features from './components/Features';  // Import Features section

import { FaCog, FaBullhorn, FaRocket, FaUsers } from 'react-icons/fa';  // Importing icons from react-icons

function AppLayout() {
  const location = useLocation();
  
  // Check if the current path matches either /squat or /push
  const hideFooter = ['/squat', '/push'].includes(location.pathname);

  // Define your features array with real icons
  const features = [
    {
      icon: <FaRocket />,  // Real icon from react-icons
      title: 'Real-time Feedback',
      description: 'Get instant corrections for your workout form.',
    },
    {
      icon: <FaCog />,  // Real icon from react-icons
      title: 'AI Powered',
      description: 'Advanced AI technology tracks your form accurately.',
    },
    {
      icon: <FaBullhorn />,  // Real icon from react-icons
      title: 'Customizable',
      description: 'Tailor your workout preferences and goals.',
    },
    {
      icon: <FaUsers />,  // Real icon from react-icons
      title: 'Community Support',
      description: 'Join a community of like-minded fitness enthusiasts.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/squat" element={<PoseDetector />} />
        <Route path="/push" element={<PushupDetector />} />
      </Routes>

      {/* Insert the Features section between Hero and Footer */}
      {location.pathname === '/' && <Features features={features} />}

      {/* Hide Footer on /squat or /push */}
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
