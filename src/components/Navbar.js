import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
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
            <Nav.Item className="text-light d-flex align-items-center">
              {renderBreadcrumb()}
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar; 