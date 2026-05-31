import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import '../../styles/AdminDashboard.css';

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('my-requests');
  
  const API_MEMBER = 'https://lms-mern-p8qq.onrender.com/api/member'; 
  
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // --- State Management ---
  const [requests, setRequests] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Form States
  const [requestData, setRequestData] = useState({ requestedTitle: '', requestedAuthor: '' });
  const [cancelEmail, setCancelEmail] = useState(''); // NEW: For cancellation

  // --- Dynamic Data Fetching ---
  useEffect(() => {
    setStatusMsg({ type: '', text: '' }); 
    if (activeTab === 'my-requests') fetchMyRequests();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`${API_MEMBER}/my-requests`, getAuthConfig());
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to load your request history.' });
      setRequests([]);
    }
  };

  // --- Form Handlers ---
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_MEMBER}/request`, requestData, getAuthConfig());
      setStatusMsg({ type: 'success', text: res.data.message || 'Request submitted successfully!' });
      setRequestData({ requestedTitle: '', requestedAuthor: '' }); 
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setLoading(false);
    }
  };

  // NEW: Cancel Membership Handler
  const handleCancelMembership = async (e) => {
    e.preventDefault();
    
    // Extra safety net
    if (!window.confirm("Are you sure you want to cancel your membership? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_MEMBER}/cancel`, { email: cancelEmail }, getAuthConfig());
      setStatusMsg({ type: 'success', text: res.data.message });
      setCancelEmail('');
      
      // Auto logout after 3 seconds since they are no longer an active member
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 3000);

    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to cancel membership.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderStatus = () => {
    if (!statusMsg.text) return null;
    return (
      <div className={`academia-alert academia-alert-${statusMsg.type}`} style={{ maxWidth: "600px", marginBottom: "20px" }}>
        {statusMsg.text}
      </div>
    );
  };

  const getBadgeType = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  };

  const renderMyRequests = () => (
    <div>
      <div className="academia-section-header">
        <h2>My Reading Queue</h2>
        <p>Track the status of your requested volumes and admin responses.</p>
      </div>
      {renderStatus()}
      
      <div className="academia-grid">
        {!Array.isArray(requests) || requests.length === 0 ? (
          <p style={{ opacity: 0.6 }}><em>You haven't requested any books yet.</em></p>
        ) : (
          requests.map(req => (
            <Card 
              key={req._id}
              title={req.requestedTitle} 
              badgeText={req.status.toUpperCase()} 
              badgeType={getBadgeType(req.status)}
            >
              <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>
                Author: {req.requestedAuthor || 'Unknown'}
              </div>
              <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '8px' }}>
                Requested on: {new Date(req.createdAt).toLocaleDateString()}
              </div>
              
              {req.adminReply && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  borderLeft: '3px solid var(--accent-color)',
                  fontSize: '13px' 
                }}>
                  <strong>Librarian Note:</strong> {req.adminReply}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderRequestForm = () => (
    <div>
      <div className="academia-section-header">
        <h2>Request a Volume</h2>
        <p>Submit a title to the librarian. You will be notified here if it is available for you to borrow.</p>
      </div>
      {renderStatus()}
      
      <div className="academia-form-panel" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleRequestSubmit}>
          <InputField 
            label="Book Title" 
            placeholder="e.g., The Great Gatsby"
            value={requestData.requestedTitle} 
            onChange={(e) => setRequestData({...requestData, requestedTitle: e.target.value})} 
            required 
          />
          <InputField 
            label="Author (Optional)" 
            placeholder="e.g., F. Scott Fitzgerald"
            value={requestData.requestedAuthor} 
            onChange={(e) => setRequestData({...requestData, requestedAuthor: e.target.value})} 
          />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text={loading ? "Sending Ticket..." : "Submit Request"} type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );

  // NEW: Settings / Cancellation Render block
  const renderSettings = () => (
    <div>
      <div className="academia-section-header">
        <h2>Account Settings</h2>
        <p>Manage your library privileges.</p>
      </div>
      {renderStatus()}

      <div className="academia-form-panel" style={{ maxWidth: "600px", borderLeft: '4px solid #e0a3a3' }}>
        <h3 style={{ color: '#e0a3a3', marginBottom: '10px', marginTop: '0' }}>Danger Zone: Cancel Membership</h3>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
          Cancelling your membership revokes borrowing privileges. You must settle any outstanding fines before proceeding. 
          To confirm cancellation, please type your registered email address below.
        </p>
        
        <form onSubmit={handleCancelMembership}>
          <InputField 
            label="Confirm Email Address" 
            placeholder="Enter your email to confirm"
            value={cancelEmail} 
            onChange={(e) => setCancelEmail(e.target.value)} 
            required 
          />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text={loading ? "Processing..." : "Cancel My Membership"} type="submit" variant="danger" />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="academia-dashboard-layout">
      <nav className="academia-sidebar">
        <div className="academia-sidebar-brand">Archivist Hub</div>
        
        <div style={{ opacity: 0.6, fontSize: '12px', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
          Reader Access
        </div>

        <button 
          className={`academia-nav-btn ${activeTab === 'my-requests' ? 'academia-nav-active' : ''}`} 
          onClick={() => setActiveTab('my-requests')}
        >
          My Reading Queue
        </button>
        <button 
          className={`academia-nav-btn ${activeTab === 'request' ? 'academia-nav-active' : ''}`} 
          onClick={() => setActiveTab('request')}
        >
          Request a Volume
        </button>
        
        {/* NEW: Settings Tab */}
        <button 
          className={`academia-nav-btn ${activeTab === 'settings' ? 'academia-nav-active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          Account Settings
        </button>

        <div style={{ flex: 1 }}></div> 
        
        <button 
          className="academia-nav-btn" 
          style={{ color: '#e0a3a3', opacity: 0.8 }}
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        >
          Sign Out
        </button>
      </nav>

      <main className="academia-content">
        {activeTab === 'my-requests' && renderMyRequests()}
        {activeTab === 'request' && renderRequestForm()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default MemberDashboard;