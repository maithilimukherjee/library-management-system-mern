import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/member/Login';
import Register from './pages/member/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Entry Portals */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. Catch-all: Direct root visits down to the sign-in sheet */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 3. Dashboard Route Placeholders (To be built next!) */}
        <Route 
          path="/dashboard" 
          element={
            <div style={{ backgroundColor: "#1c120c", color: "#f5edd6", height: "100vh", padding: "40px", fontFamily: "Georgia" }}>
              <h2>Reader Archive Dashboard</h2>
              <p>Welcome back. Coming up: Book searching catalog and self-cancellation portal.</p>
            </div>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <div style={{ backgroundColor: "#1c120c", color: "#f5edd6", height: "100vh", padding: "40px", fontFamily: "Georgia" }}>
              <h2>Archivist Master Control</h2>
              <p>Salutations, Admin. Coming up: Member lifecycle, logging view, and loan book controls.</p>
            </div>
          } 
        />

        {/* 4. Handle 404 Missing Documents cleanly */}
        <Route 
          path="*" 
          element={
            <div style={{ backgroundColor: "#1c120c", color: "#e0a3a3", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "Georgia" }}>
              <h1>404: Document Missing</h1>
              <p style={{ opacity: 0.6, fontStyle: "italic" }}>This volume does not exist within our records.</p>
              <a href="/login" style={{ color: "#8c6d3e", marginTop: "20px" }}>Return to Ledger</a>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;