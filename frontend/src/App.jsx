import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard'; // Import the new Archivist Dashboard

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Entry Portals */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. Catch-all: Direct root visits down to the sign-in sheet */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 3. Dashboard Routes */}
        <Route 
          path="/dashboard" 
        />
        
        {/* Live Archivist Master Control */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* 4. Handle 404 Missing Documents cleanly */}
        <Route 
          path="*" 
          element={
            <div style={{ backgroundColor: "var(--bg)", color: "#e0a3a3", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "var(--heading)" }}>
              <h1>404: Document Missing</h1>
              <p style={{ opacity: 0.8, fontStyle: "italic", fontFamily: "var(--sans)" }}>This volume does not exist within our records.</p>
              <a href="/login" style={{ color: "var(--accent)", marginTop: "20px", textDecoration: "none", borderBottom: "1px solid var(--accent)" }}>Return to Ledger</a>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;