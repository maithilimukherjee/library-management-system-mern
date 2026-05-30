import React, { useState } from 'react';
import axios from 'axios';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import '../../styles/Login.css';

const Login = () => {
  const [role, setRole] = useState('member'); // Toggle state between 'member' and 'admin'
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ error: '', success: '' });

    // Dynamically target endpoints depending on the active portal role selector
    const targetUrl = role === 'admin' 
      ? 'https://lms-mern-p8qq.onrender.com/api/admin/login'
      : 'https://lms-mern-p8qq.onrender.com/api/auth/';

    try {
      const response = await axios.post(targetUrl, { email });
      const { token, message } = response.data;

      // Commit security token credentials to browser cache storage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      setStatus({ error: '', success: `${message || "Access granted."} Synchronizing dashboard...` });
      
      // Redirect behavior will handle actual routing next
      setTimeout(() => {
        window.location.href = role === 'admin' ? '/admin/dashboard' : '/dashboard';
      }, 1500);

    } catch (err) {
      setStatus({
        success: '',
        error: err.response?.data?.message || "Credentials unverified by institutional ledger."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academia-login-container">
      <div className="academia-login-box">

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
        
        <div className="academia-login-header">
          <h2>Sign Ledger</h2>
          <p>Provide your electronic identifier to restore your session profile.</p>
        </div>

        {/* Dynamic Alerts */}
        {status.error && <div className="academia-alert academia-alert-error">{status.error}</div>}
        {status.success && <div className="academia-alert academia-alert-success">{status.success}</div>}

        <form onSubmit={handleLogin}>
          <InputField 
            label={role === 'admin' ? "Archivist Token Email" : "Registered Ledger Email"}
            type="email"
            placeholder="name@academy.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={true}
          />

          <div style={{ marginTop: "25px" }}>
            <Button 
              text={loading ? "Verifying..." : "Verify Identity"} 
              type="submit" 
              variant={role === 'admin' ? "accent" : "primary"}
              style={{ width: "100%" }}
            />
          </div>
        </form>

        {role === 'member' && (
          <div className="academia-login-footer">
            New to the library records? 
            <a href="/register" className="academia-register-link">Add to roll</a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;