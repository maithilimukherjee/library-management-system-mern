import React from 'react';
import '../styles/Button.css'; // Make sure the path matches your folder tree!

const Button = ({ text, onClick, type = "button", variant = "primary" }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`academia-btn academia-btn-${variant}`}
    >
      {text}
    </button>
  );
};

export default Button;