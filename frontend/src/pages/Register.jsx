import React, { useState } from 'react';
import axios from 'axios';
import InputField from '../components/InputField'; 
import Button from '../components/Button';         
import '../styles/Register.css'; // Make sure this shares the .academia-role-tabs CSS from Login!

const Register = () => {
  const [role, setRole] = useState('member');
  const [formData, setFormData] = useState({ name: '', email: '', hireDate: '' });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ error: '', success: '' });

    const targetUrl = role === 'admin' 
      ? 'https://lms-mern-p8qq.onrender.com/api/admin/register'
      : 'https://lms-mern-p8qq.onrender.com/api/auth/member-register';

    // Filter payload: members don't need a hireDate
    const payload = role === 'admin' 
      ? formData 
      : { name: formData.name, email: formData.email };

    try {
      const response = await axios.post(targetUrl, payload);
      
      setStatus({ 
        error: '', 
        success: `${response.data.message || "Registration successful."} Welcome to the archive.` 
      });
      setFormData({ name: '', email: '', hireDate: '' }); 
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
        
        {/* Identity Role Selection Header */}
        <div className="academia-role-tabs">
          <button 
            type="button"
            className={`academia-tab ${role === 'member' ? 'academia-tab-active' : ''}`}
            onClick={() => { setRole('member'); setStatus({ error: '', success: '' }); }}
          >
            Reader Roll
          </button>
          <button 
            type="button"
            className={`academia-tab ${role === 'admin' ? 'academia-tab-active' : ''}`}
            onClick={() => { setRole('admin'); setStatus({ error: '', success: '' }); }}
          >
            Archivist
          </button>
        </div>

        <div className="academia-register-header">
          <h2>Library Roll</h2>
          <p>
            {role === 'admin' 
              ? "Enter your credentials to register into the faculty ledger."
              : "Enter your credentials to register into the institutional ledger."}
          </p>
        </div>

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

          {/* Conditionally render hireDate for Admins */}
          {role === 'admin' && (
            <InputField 
              label="Date of Appointment"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={handleChange}
              required={true}
            />
          )}

          <div style={{ marginTop: "25px" }}>
            <Button 
              text={loading ? "Recording..." : "Register Account"} 
              type="submit" 
              variant={role === 'admin' ? "accent" : "primary"}
              style={{ width: "100%" }} 
            />
          </div>
        </form>

        <div className="academia-register-footer">
          {role === 'member' ? (
            <>
              Already cataloged? 
              <a href="/login" className="academia-register-link">Sign the ledger</a>
            </>
          ) : (
            <>
              Already on staff? 
              <a href="/login" className="academia-register-link">Access records</a>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Register;