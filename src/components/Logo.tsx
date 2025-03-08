import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="logo-container tracking-wide">
        <span 
          className={`text-xl font-bold ${
            isDarkMode ? 'text-sky-400' : 'text-blue-900'
          } letter-spacing-wide font-display`}
          style={{ letterSpacing: '0.03em' }}
        >
          CollegeMate
        </span>
        <span 
          className={`text-xs ml-1.5 font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-slate-500'
          }`}
          style={{ letterSpacing: '0.02em' }}
        >
          by streamverse
        </span>
      </div>
    </Link>
  );
};

export default Logo; 