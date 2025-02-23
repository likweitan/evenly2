import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import GroupPage from './GroupPage';
import ReceiptPage from './ReceiptPage';
import AppNavbar from './components/Navbar';
import AuthWrapper from './components/AuthWrapper';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [showUserModal, setShowUserModal] = useState(false);

  return (
    <Router>
      <div>
        <AppNavbar 
          showUserModal={showUserModal} 
          setShowUserModal={setShowUserModal} 
        />
        <AuthWrapper setShowUserModal={setShowUserModal}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/group/:groupId" element={<GroupPage />} />
            <Route path="/group/:groupId/receipt/:receiptId" element={<ReceiptPage />} />
          </Routes>
        </AuthWrapper>
      </div>
    </Router>
  );
}

export default App;