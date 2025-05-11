
import React from "react";

interface DoshaIconProps {
  className?: string;
  size?: number;
}

export const VataIcon: React.FC<DoshaIconProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`rounded-full flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    </div>
  );
};

export const PittaIcon: React.FC<DoshaIconProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`rounded-full flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12a4 4 0 0 1 8 0" />
        <line x1="12" y1="10" x2="12" y2="10" />
      </svg>
    </div>
  );
};

export const KaphaIcon: React.FC<DoshaIconProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`rounded-full flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 22a8 8 0 0 0 8-8c0-5-8-13-8-13S4 9 4 14a8 8 0 0 0 8 8Z" />
      </svg>
    </div>
  );
};
