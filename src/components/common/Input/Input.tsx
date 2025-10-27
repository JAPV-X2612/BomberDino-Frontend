import React from 'react';
import './Input.css';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'number';
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = '',
  maxLength,
  type = 'text',
}) => {
  return (
    <input
      className="input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
};
