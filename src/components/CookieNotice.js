import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const CookieNotice = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check on mount if user has acknowledged
    const hasAcknowledged = localStorage.getItem('cookieAcknowledged');
    if (!hasAcknowledged) {
      setShowNotice(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAcknowledged', 'true');
    setShowNotice(false);
  };

  return (
    <Modal 
      show={showNotice} 
      onHide={handleAccept}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>Cookie Notice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          This app uses local storage to enhance your experience by:
        </p>
        <ul className="mb-3">
          <li>Remembering your recently visited groups</li>
          <li>Saving your preferences</li>
          <li>Improving app performance</li>
        </ul>
        <p className="mb-0">
          By clicking "I Understand", you agree to the storage of this information on your device.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleAccept}>
          I Understand
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CookieNotice; 