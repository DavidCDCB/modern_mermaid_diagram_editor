import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect className="logo-background" width="32" height="32" rx="6" fill="url(#logoGrad)" />
      <path
        className="logo-connector"
        d="M16 11v4M16 15H8.5V20M16 15h7.5V20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect className="logo-node" x="12" y="4" width="8" height="7" rx="2" fill="white" />
      <rect className="logo-node" x="4" y="20" width="9" height="8" rx="2" fill="white" />
      <rect className="logo-node" x="19" y="20" width="9" height="8" rx="2" fill="white" />
      <circle cx="16" cy="7.5" r="1.25" fill="#6d5dfc" />
      <circle cx="8.5" cy="24" r="1.25" fill="#6d5dfc" />
      <circle cx="23.5" cy="24" r="1.25" fill="#6d5dfc" />
    </svg>
  );
};

export default Logo;

