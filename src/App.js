import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import GroupPage from './GroupPage';
import ReceiptPage from './ReceiptPage';
import AppNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/group/:groupId" element={<GroupPage />} />
          <Route path="/group/:groupId/receipt/:receiptId" element={<ReceiptPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;