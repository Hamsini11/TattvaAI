
import React from "react";
import LeafIcon from "./icons/LeafIcon";

const Footer: React.FC = () => {
  return (
    <footer className="bg-tattva-green-dark text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <LeafIcon className="mr-2" size={20} />
            <span className="text-lg font-semibold">Tattva AI</span>
          </div>
          
          <div className="text-sm text-gray-200">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-tattva-green">
          <p className="text-sm text-center text-gray-300">
            Discover your natural balance through ancient wisdom. Tattva AI combines traditional Ayurvedic principles with modern technology.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
