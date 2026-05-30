import React, { useState } from 'react';
import axios from 'axios';
import InputField from '../../components/InputField'; // Fixed relative path up two levels
import Button from '../../components/Button';         // Fixed relative path up two levels
import '../../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ error: '', success: '' });

    try {
      // Connects directly to your deployed Render API namespace
      const response = await axios.post('https://lms-mern-p8qq.onrender.com/api/auth/member-register', formData);
      
      setStatus({ 
        error: '', 
        success: `${response.data.message || "Registration successful."} Welcome to the archive.` 
      });
      setFormData({ name: '', email: '' }); // Clear fields upon success
    } catch (err) {
      setStatus({ 
        success: '', 
        error: err.response?.data?.message || "An historical discrepancy occurred. Try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academia-register-container">
      <div className="academia-register-box">
        
        <div className="academia-register-header">
          <h2>Library Roll</h2>
          <p>Enter your credentials to register into the institutional ledger.</p>
        </div>

        {/* Status Alerts */}
        {status.error && <div className="academia-alert academia-alert-error">{status.error}</div>}
        {status.success && <div className="academia-alert academia-alert-success">{status.success}</div>}

        <form onSubmit={handleRegister}>
          <InputField 
            label="Full Name"
            name="name"
            type="text"
            placeholder="e.g., Julian Johns"
            value={formData.name}
            onChange={handleChange}
            required={true}
          />

          <InputField 
            label="Institutional Email"
            name="email"
            type="email"
            placeholder="name@academy.edu"
            value={formData.email}
            onChange={handleChange}
            required={true}
          />

          <div style={{ marginTop: "25px" }}>
            <Button 
              text={loading ? "Recording..." : "Register Account"} 
              type="submit" 
              variant="primary"
              style={{ width: "100%" }} 
            />
          </div>
        </form>

        <div className="academia-register-footer">
          Already cataloged? 
          <a href="/login" className="academia-register-link">Sign the ledger</a>
        </div>

      </div>
    </div>
  );
};

export default Register;