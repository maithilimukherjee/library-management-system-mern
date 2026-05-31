import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const API_BOOKS = 'https://lms-mern-p8qq.onrender.com/api/book'; 
  const API_ADMIN = 'https://lms-mern-p8qq.onrender.com/api/admin'; 
  
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // --- State Management ---
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]); // NEW: Request queue state
  
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Form States
  const [addBookData, setAddBookData] = useState({ name: '', isbn: '', info: '' });
  const [lendData, setLendData] = useState({ bookId: '', memberId: '', dueDate: '' });
  const [returnData, setReturnData] = useState({ bookId: '', memberId: '' });

  // --- Dynamic Data Fetching ---
  useEffect(() => {
    setStatusMsg({ type: '', text: '' }); // Clear messages on tab switch
    if (activeTab === 'inventory') fetchInventory();
    if (activeTab === 'members') fetchMembers();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'requests') fetchRequests(); // NEW: Fetch requests
  }, [activeTab]);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_ADMIN}/books`, getAuthConfig());
      setBooks(Array.isArray(res.data) ? res.data : res.data.books || []);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to fetch ledger inventory.' });
      setBooks([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_ADMIN}/members`, getAuthConfig());
      setMembers(Array.isArray(res.data) ? res.data : res.data.members || []);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to fetch member registry.' });
      setMembers([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_ADMIN}/transactions`, getAuthConfig());
      setTransactions(Array.isArray(res.data) ? res.data : res.data.transactions || []);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to fetch transaction ledger.' });
      setTransactions([]);
    }
  };

  // NEW: Fetch Pending Requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_ADMIN}/requests`, getAuthConfig());
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to fetch pending requests.' });
      setRequests([]);
    }
  };

  // --- Lifecycle Actions ---
  const handleToggleMembership = async (memberId, currentStatus) => {
    try {
      const endpoint = currentStatus === 'active' ? '/suspend' : '/reactivate';
      await axios.post(`${API_ADMIN}${endpoint}`, { memberId }, getAuthConfig());
      setStatusMsg({ type: 'success', text: `Member account ${currentStatus === 'active' ? 'suspended' : 'reactivated'}.` });
      fetchMembers(); 
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update member status.' });
    }
  };

  // NEW: Respond to Member Request
  const handleRespondRequest = async (requestId, status) => {
    // Prompt the admin for an optional note to send back to the member
    const adminReply = window.prompt(`You are marking this request as ${status.toUpperCase()}.\n\nEnter an optional note for the member (e.g. "We ordered it" or "Pick it up tomorrow"):`);
    
    if (adminReply === null) return; // Cancelled if they hit Escape or Cancel

    try {
      await axios.post(`${API_ADMIN}/requests/${requestId}/respond`, { status, adminReply }, getAuthConfig());
      setStatusMsg({ type: 'success', text: `Request marked as ${status}.` });
      fetchRequests(); // Refresh the queue
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to respond to request.' });
    }
  };

  // --- Book Operations ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BOOKS}/add`, addBookData, getAuthConfig());
      setStatusMsg({ type: 'success', text: `Volume cataloged: ${res.data.newBook.name}` });
      setAddBookData({ name: '', isbn: '', info: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || "Failed to catalog volume." });
    } finally {
      setLoading(false);
    }
  };

  const handleLendBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BOOKS}/lend`, lendData, getAuthConfig());
      setStatusMsg({ type: 'success', text: "Volume successfully issued to member." });
      setLendData({ bookId: '', memberId: '', dueDate: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || "Lending transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BOOKS}/return`, returnData, getAuthConfig());
      const fineText = res.data.fineCharged > 0 ? ` Fine accrued: ₹${res.data.fineCharged}.` : "";
      setStatusMsg({ type: 'success', text: `Volume returned successfully.${fineText}` });
      setReturnData({ bookId: '', memberId: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || "Return processing failed." });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderStatus = () => {
    if (!statusMsg.text) return null;
    return (
      <div className={`academia-alert academia-alert-${statusMsg.type}`} style={{ maxWidth: "500px", marginBottom: "20px" }}>
        {statusMsg.text}
      </div>
    );
  };

  // NEW: Render Request Queue
  const renderRequests = () => (
    <div>
      <div className="academia-section-header">
        <h2>Request Queue</h2>
        <p>Review and respond to member volume requests.</p>
      </div>
      {renderStatus()}
      <div className="academia-grid">
        {!Array.isArray(requests) || requests.length === 0 ? (
          <p style={{ opacity: 0.6 }}><em>No pending requests in the queue.</em></p>
        ) : (
          requests.map(req => (
            <Card 
              key={req._id}
              title={req.requestedTitle} 
              badgeText="PENDING" 
              badgeType="secondary"
              actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button text="Approve" variant="success" onClick={() => handleRespondRequest(req._id, 'approved')} />
                  <Button text="Reject" variant="danger" onClick={() => handleRespondRequest(req._id, 'rejected')} />
                </div>
              }
            >
              <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '4px' }}>
                Author: {req.requestedAuthor || 'Unknown'}
              </div>
              <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>
                Member: {req.memberId?.name || req.memberId?.email || 'Unknown User'}
              </div>
              <div style={{ opacity: 0.6, fontSize: '11px' }}>
                Submitted: {new Date(req.createdAt).toLocaleString()}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div>
      <div className="academia-section-header">
        <h2>Archive Inventory</h2>
        <p>Currently cataloged volumes and their availability status.</p>
      </div>
      {renderStatus()}
      <div className="academia-grid">
        {!Array.isArray(books) || books.length === 0 ? (
          <p style={{ opacity: 0.6 }}><em>The ledger is empty.</em></p>
        ) : (
          books.map(book => (
            <Card 
              key={book._id}
              title={book.name} 
              badgeText={book.avStatus ? "Available" : "Checked Out"} 
              badgeType={book.avStatus ? "success" : "danger"}
            >
              <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>{book.info}</div>
              <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '4px' }}>ISBN: {book.isbn}</div>
              <div style={{ opacity: 0.6, fontSize: '11px', fontFamily: 'var(--mono)' }}>ID: {book._id}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderMembers = () => (
    <div>
      <div className="academia-section-header">
        <h2>Member Registry</h2>
        <p>Overview of institutional readers, active standing, and fine balances.</p>
      </div>
      {renderStatus()}
      <div className="academia-grid">
        {!Array.isArray(members) || members.length === 0 ? (
          <p style={{ opacity: 0.6 }}><em>No registered members.</em></p>
        ) : (
          members.map(member => (
            <Card 
              key={member._id}
              title={member.name || member.email.split('@')[0]} 
              badgeText={member.memStatus} 
              badgeType={member.memStatus === 'active' ? "success" : "danger"}
              actions={
                <Button 
                  text={member.memStatus === 'active' ? "Suspend" : "Reactivate"} 
                  variant={member.memStatus === 'active' ? "secondary" : "accent"}
                  onClick={() => handleToggleMembership(member._id, member.memStatus)}
                />
              }
            >
              <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>{member.email}</div>
              <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '4px', color: member.fine > 0 ? '#e0a3a3' : 'inherit' }}>
                Pending Fines: ₹{member.fine || 0}
              </div>
              <div style={{ opacity: 0.6, fontSize: '11px', fontFamily: 'var(--mono)' }}>ID: {member._id}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div>
      <div className="academia-section-header">
        <h2>Ledger Records</h2>
        <p>Complete historical logs of all borrowing and returning events.</p>
      </div>
      {renderStatus()}
      <div className="academia-grid">
        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <p style={{ opacity: 0.6 }}><em>No transactions recorded.</em></p>
        ) : (
          transactions.map(txn => (
            <Card 
              key={txn._id}
              title={`Book ID: ${txn.bookId ? txn.bookId.slice(-6) : 'Unknown'}`} 
              badgeText={txn.returnDate ? "Returned" : "Active"} 
              badgeType={txn.returnDate ? "secondary" : "accent"}
            >
              <div style={{ opacity: 0.8, fontSize: '13px', marginBottom: '4px' }}>Member: {txn.memberId}</div>
              <div style={{ opacity: 0.6, fontSize: '12px', marginBottom: '4px' }}>
                Due: {new Date(txn.dueDate).toLocaleDateString()}
              </div>
              {txn.returnDate && (
                <div style={{ opacity: 0.6, fontSize: '12px' }}>
                  Returned: {new Date(txn.returnDate).toLocaleDateString()}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAddBook = () => (
    <div>
      <div className="academia-section-header">
        <h2>Acquisition Ledger</h2>
        <p>Record a newly acquired volume into the institutional records.</p>
      </div>
      {renderStatus()}
      <div className="academia-form-panel">
        <form onSubmit={handleAddBook}>
          <InputField label="Title of Volume" value={addBookData.name} onChange={(e) => setAddBookData({...addBookData, name: e.target.value})} required />
          <InputField label="ISBN Number" value={addBookData.isbn} onChange={(e) => setAddBookData({...addBookData, isbn: e.target.value})} required />
          <InputField label="Additional Info (Author, Edition)" value={addBookData.info} onChange={(e) => setAddBookData({...addBookData, info: e.target.value})} />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text={loading ? "Writing..." : "Catalog Book"} type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );

  const renderLending = () => (
    <div>
      <div className="academia-section-header">
        <h2>Lending Desk</h2>
        <p>Authorize the borrowing of a volume using system IDs.</p>
      </div>
      {renderStatus()}
      <div className="academia-form-panel">
        <form onSubmit={handleLendBook}>
          <InputField label="System Book ID" placeholder="From Inventory tab" value={lendData.bookId} onChange={(e) => setLendData({...lendData, bookId: e.target.value})} required />
          <InputField label="System Member ID" placeholder="From Registry tab" value={lendData.memberId} onChange={(e) => setLendData({...lendData, memberId: e.target.value})} required />
          <InputField label="Due Date" type="date" value={lendData.dueDate} onChange={(e) => setLendData({...lendData, dueDate: e.target.value})} required />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text={loading ? "Processing..." : "Authorize Loan"} type="submit" variant="accent" />
          </div>
        </form>
      </div>
    </div>
  );

  const renderReturns = () => (
    <div>
      <div className="academia-section-header">
        <h2>Return Desk</h2>
        <p>Process a returned volume and restore its available status.</p>
      </div>
      {renderStatus()}
      <div className="academia-form-panel">
        <form onSubmit={handleReturnBook}>
          <InputField label="System Book ID" value={returnData.bookId} onChange={(e) => setReturnData({...returnData, bookId: e.target.value})} required />
          <InputField label="System Member ID" value={returnData.memberId} onChange={(e) => setReturnData({...returnData, memberId: e.target.value})} required />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text={loading ? "Processing..." : "Process Return"} type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="academia-dashboard-layout">
      <nav className="academia-sidebar">
        <div className="academia-sidebar-brand">Archivist Hub</div>
        
        {/* NEW: Requests tab placed prominently */}
        <button className={`academia-nav-btn ${activeTab === 'requests' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('requests')}>
          Pending Requests
        </button>
        <button className={`academia-nav-btn ${activeTab === 'inventory' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('inventory')}>
          Existing Volumes
        </button>
        <button className={`academia-nav-btn ${activeTab === 'members' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('members')}>
          Member Registry
        </button>
        <button className={`academia-nav-btn ${activeTab === 'transactions' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('transactions')}>
          Ledger Records
        </button>
        <button className={`academia-nav-btn ${activeTab === 'add' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('add')}>
          Catalog New Book
        </button>
        <button className={`academia-nav-btn ${activeTab === 'lend' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('lend')}>
          Lending Desk
        </button>
        <button className={`academia-nav-btn ${activeTab === 'return' ? 'academia-nav-active' : ''}`} onClick={() => setActiveTab('return')}>
          Process Returns
        </button>

        <div style={{ flex: 1 }}></div> 
        <button 
          className="academia-nav-btn" 
          style={{ color: '#e0a3a3', opacity: 0.8 }}
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        >
          Sign Out Ledger
        </button>
      </nav>

      <main className="academia-content">
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'add' && renderAddBook()}
        {activeTab === 'lend' && renderLending()}
        {activeTab === 'return' && renderReturns()}
      </main>
    </div>
  );
};

export default AdminDashboard;