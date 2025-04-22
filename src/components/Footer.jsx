import React from 'react';
import { Activity, Github, Twitter, Instagram } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold">AI Fitness Coach</span>
            </div>
            <p className="mt-4 text-gray-400">
              Transform your fitness journey with AI-powered guidance and personalized workout plans.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-300 hover:text-gray-100">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-300 hover:text-gray-100">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-300 hover:text-gray-100">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-300 hover:text-gray-100">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Follow Us</h3>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            © 2025 AI Fitness Coach. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
