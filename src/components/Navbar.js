import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button, Modal, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const UserModal = ({ show, onHide, onSignIn }) => {
  const [username, setUsername] = useState('');

  // Load current username when modal opens
  useEffect(() => {
    if (show) {
      const currentUsername = Cookies.get('username');
      if (currentUsername) {
        setUsername(currentUsername);
      }
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      const trimmedUsername = username.trim();
      Cookies.set('username', trimmedUsername, { expires: 365 });
      onSignIn(trimmedUsername);
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your preferred username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const AppNavbar = ({ showUserModal, setShowUserModal }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const savedUsername = Cookies.get('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSignOut = () => {
    Cookies.remove('username');
    setUsername('');
    if (location.pathname !== '/') {
      setShowUserModal(true);
    }
  };
  
  const handleSignIn = (newUsername) => {
    setUsername(newUsername);
  };

  const renderBreadcrumb = () => {
    if (pathSegments.length === 0) return 'Home';
    
    if (pathSegments[0] === 'group') {
      if (pathSegments.length === 1) return 'Home';
      if (pathSegments.length === 2) return 'Group';
      if (pathSegments.length === 4 && pathSegments[2] === 'receipt') return 'Receipt';
    }
    
    return 'Home';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Evenly</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Home
            </Nav.Link> */}
          </Nav>
          <Nav>
            {username && (
              <div 
                className="d-flex align-items-center text-light" 
                style={{ cursor: 'pointer' }}
                onClick={handleSignOut}
              >
                <span>Signed in as: {username}</span>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        onSignIn={handleSignIn}
      />
    </Navbar>
  );
};

export default AppNavbar; 