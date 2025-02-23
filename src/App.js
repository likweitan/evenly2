import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './Homepage';
import GroupPage from './GroupPage';
import ReceiptPage from './ReceiptPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/group/:groupId/receipt/:receiptId" element={<ReceiptPage />} />
      </Routes>
    </Router>
  );
}

export default App;