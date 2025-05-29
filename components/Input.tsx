
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="mb-4 w-full">
      {label && <label className="block text-yellow-400 text-sm font-bold mb-2 game-font-applied" htmlFor={props.id || props.name}>{label}</label>}
      <input
        className={`bg-purple-700 shadow-inner appearance-none border-2 border-yellow-500 rounded w-full py-2 px-3 text-yellow-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-300 placeholder-yellow-500 opacity-80 ${className || ''}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;