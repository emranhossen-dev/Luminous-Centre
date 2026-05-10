'use client';

import React from 'react';

interface BestSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const BestSpinner: React.FC<BestSpinnerProps> = ({ 
  size = 'medium', 
  color = '#fff',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-[60px] h-3',
    large: 'w-20 h-4'
  };

  const ballSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <style jsx>{`
        .loader {
          width: 60px;
          display: flex;
          justify-content: space-evenly;
        }

        .ball {
          list-style: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${color};
        }

        .ball:nth-child(1) {
          animation: bounce-1 2.1s ease-in-out infinite;
        }

        @keyframes bounce-1 {
          50% {
            transform: translateY(-18px);
          }
        }

        .ball:nth-child(2) {
          animation: bounce-3 2.1s ease-in-out 0.3s infinite;
        }

        @keyframes bounce-2 {
          50% {
            transform: translateY(-18px);
          }
        }

        .ball:nth-child(3) {
          animation: bounce-3 2.1s ease-in-out 0.6s infinite;
        }

        @keyframes bounce-3 {
          50% {
            transform: translateY(-18px);
          }
        }
      `}</style>
      
      <div className="loader">
        <li className="ball" />
        <li className="ball" />
        <li className="ball" />
      </div>
    </div>
  );
};

export default BestSpinner;
