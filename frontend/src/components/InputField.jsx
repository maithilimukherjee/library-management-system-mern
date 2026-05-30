import React from 'react';
import '../styles/InputField.css';

const InputField = ({ label, type = "text", placeholder, value, onChange, name, required = false }) => {
  return (
    <div className="academia-input-group">
      {label && <label className="academia-label">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="academia-input"
      />
    </div>
  );
};

export default InputField;