import React, { useState } from "react";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80)",
          transform: isHovered ? "scale(1.1)" : "scale(1.05)"
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      
      {/* Golden accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
      
      {/* Content container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8">
        {/* Main content */}
        <div 
          className="max-w-3xl mx-auto transform transition-all duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Brand mark */}
          <div className="mb-6 flex justify-center">
            <Sparkles size={32} className="text-amber-400" />
          </div>
          
          {/* Heading with fancy styling */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-wide">
            <span className="text-amber-400">E</span>levate 
            <span className="mx-3 opacity-80">Your</span> 
            <span className="text-amber-400">S</span>tyle
          </h1>
          
          {/* Elegant divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-6"></div>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
            Experience the art of hair transformation with our award-winning stylists. 
            Indulge in a personalized beauty journey crafted exclusively for you.
          </p>
          
          {/* CTA button with hover effect */}
          <button
            onClick={onBookNow}
            className="group relative overflow-hidden bg-transparent border border-amber-400 text-amber-400 hover:text-black font-medium py-3 px-8 rounded-none transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="relative z-10">BOOK AN APPOINTMENT</span>
            <span className="absolute inset-0 bg-amber-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </button>
          
          {/* Secondary link */}
          {/* <div className="mt-6">
            <a href="#services" className="text-gray-300 hover:text-amber-400 text-sm uppercase tracking-widest transition-colors duration-300">
              Explore Our Services
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;