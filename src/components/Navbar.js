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

const AppNavbar = () => {
  return (
    <Navbar bg="light" data-bs-theme="light">
      <Container>
        <Navbar.Brand as={Link} to="/">Evenly</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link 
              href="https://github.com/likweitan/evenly2/tree/main" 
              target="_blank" 
              rel="noopener noreferrer"
              className="d-flex align-items-center"
            >
              <i className="bi bi-github" style={{ fontSize: '1.2rem' }}></i>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar; 