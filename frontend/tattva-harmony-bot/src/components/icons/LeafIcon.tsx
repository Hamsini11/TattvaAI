
import React from "react";

interface LeafIconProps {
  className?: string;
  size?: number;
}

const LeafIcon: React.FC<LeafIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4.5 1.5-3 3-7 3-10 0 0-3 1-5.5 3.5S0 17 0 17"></path>
      <path d="M8.5 17c0 0 .5-1 1.5-2s2-1.5 3-1.5c2.5 0 3.5 1.5 3.5 1.5"></path>
      <path d="M9 7c0 0 1.5-1 3-1s2.5 1 2.5 1"></path>
    </svg>
  );
};

export default LeafIcon;
