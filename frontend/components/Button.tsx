
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className, ...props }) => {
  const baseStyle = "font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 game-font-applied";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary': 
      variantStyle = 'bg-yellow-500 hover:bg-yellow-600 text-purple-800 focus:ring-yellow-400';
      break;
    case 'secondary': 
      variantStyle = 'bg-purple-600 hover:bg-purple-700 text-yellow-300 focus:ring-purple-500';
      break;
    case 'danger': 
      variantStyle = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
    case 'warning': 
      variantStyle = 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400';
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'py-1 px-3 text-sm';
      break;
    case 'md':
      sizeStyle = 'py-2 px-4 text-base';
      break;
    case 'lg':
      sizeStyle = 'py-3 px-6 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;