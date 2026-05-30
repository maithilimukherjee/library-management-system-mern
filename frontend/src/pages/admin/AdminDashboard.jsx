import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  // --- Render Helpers for Each Section ---

  const renderInventory = () => (
    <div>
      <div className="academia-section-header">
        <h2>Archive Inventory</h2>
        <p>Currently cataloged volumes and their availability status.</p>
      </div>
      <div className="academia-grid">
        {/* Placeholder Data - Will be replaced by a GET request later */}
        <Card title="The Secret History" badgeText="Available" badgeType="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, marginBottom: '8px' }}>
            <span>Author: Donna Tartt</span>
            <span>Copies: 3</span>
          </div>
          <div style={{ opacity: 0.6, fontSize: '13px' }}>ISBN: 978-0679764045</div>
        </Card>
        <Card title="If We Were Villains" badgeText="Checked Out" badgeType="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, marginBottom: '8px' }}>
            <span>Author: M.L. Rio</span>
            <span>Copies: 0</span>
          </div>
          <div style={{ opacity: 0.6, fontSize: '13px' }}>ISBN: 978-1250095282</div>
        </Card>
      </div>
    </div>
  );

  const renderAddBook = () => (
    <div>
      <div className="academia-section-header">
        <h2>Acquisition Ledger</h2>
        <p>Record a newly acquired volume into the institutional records.</p>
      </div>
      <div className="academia-form-panel">
        <form onSubmit={(e) => e.preventDefault()}>
          <InputField label="Title of Volume" placeholder="e.g., The Picture of Dorian Gray" required />
          <InputField label="Author" placeholder="e.g., Oscar Wilde" required />
          <InputField label="ISBN Number" placeholder="e.g., 978-0141439570" required />
          <InputField label="Total Copies" type="number" placeholder="1" required />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text="Catalog Book" type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );

  const renderLending = () => (
    <div>
      <div className="academia-section-header">
        <h2>Lending Desk</h2>
        <p>Authorize the borrowing of a volume by a registered member.</p>
      </div>
      <div className="academia-form-panel">
        <form onSubmit={(e) => e.preventDefault()}>
          <InputField label="Member Identifier (Email)" placeholder="member@academy.edu" type="email" required />
          <InputField label="Volume ISBN" placeholder="Scan or type ISBN" required />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text="Authorize Loan" type="submit" variant="accent" />
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
      <div className="academia-form-panel">
        <form onSubmit={(e) => e.preventDefault()}>
          <InputField label="Volume ISBN" placeholder="Scan or type ISBN" required />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button text="Process Return" type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div>
      <div className="academia-section-header">
        <h2>Member Registry</h2>
        <p>Overview of institutional readers and their standing.</p>
      </div>
      <div className="academia-grid">
        {/* Placeholder Data */}
        <Card 
          title="Julian Johns" 
          badgeText="Good Standing" 
          badgeType="success"
          actions={<Button text="Suspend" variant="secondary" />}
        >
          <div style={{ opacity: 0.8, marginBottom: '8px' }}>julian@academy.edu</div>
          <div style={{ opacity: 0.6, fontSize: '13px' }}>Active Loans: 2</div>
        </Card>
        <Card 
          title="Richard Papen" 
          badgeText="Overdue Fine" 
          badgeType="danger"
          actions={<Button text="Clear Fine" variant="accent" />}
        >
          <div style={{ opacity: 0.8, marginBottom: '8px' }}>richard@academy.edu</div>
          <div style={{ opacity: 0.6, fontSize: '13px' }}>Debt: $15.00</div>
        </Card>
      </div>
    </div>
  );

  // --- Main Layout Render ---
  return (
    <div className="academia-dashboard-layout">
      
      {/* Fixed Sidebar */}
      <nav className="academia-sidebar">
        <div className="academia-sidebar-brand">Archivist Hub</div>
        
        <button 
          className={`academia-nav-btn ${activeTab === 'inventory' ? 'academia-nav-active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Existing Volumes
        </button>
        <button 
          className={`academia-nav-btn ${activeTab === 'add' ? 'academia-nav-active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Catalog New Book
        </button>
        <button 
          className={`academia-nav-btn ${activeTab === 'lend' ? 'academia-nav-active' : ''}`}
          onClick={() => setActiveTab('lend')}
        >
          Lending Desk
        </button>
        <button 
          className={`academia-nav-btn ${activeTab === 'return' ? 'academia-nav-active' : ''}`}
          onClick={() => setActiveTab('return')}
        >
          Process Returns
        </button>
        <button 
          className={`academia-nav-btn ${activeTab === 'members' ? 'academia-nav-active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Member Registry
        </button>

        <div style={{ flex: 1 }}></div> {/* Spacer to push logout to bottom */}
        
        <button 
          className="academia-nav-btn" 
          style={{ color: '#e0a3a3', opacity: 0.8 }}
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Sign Out Ledger
        </button>
      </nav>

      {/* Dynamic Main Workspace */}
      <main className="academia-content">
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'add' && renderAddBook()}
        {activeTab === 'lend' && renderLending()}
        {activeTab === 'return' && renderReturns()}
        {activeTab === 'members' && renderMembers()}
      </main>

    </div>
  );
};

export default AdminDashboard;