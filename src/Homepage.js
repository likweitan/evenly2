import React, { useState } from 'react';
import { Container, Card, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createGroup } from './firebaseUtils';
import Cookies from 'js-cookie';

// Add UserModal component
const UserModal = ({ show, onHide }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      const trimmedUsername = username.trim();
      Cookies.set('username', trimmedUsername, { expires: 365 });
      window.location.reload(); // Reload to update all components
      onHide();
      setUsername('');
    }
  };

  return (
    <Modal show={show} onHide={() => {
      onHide();
      setUsername('');
    }} centered>
      <Modal.Header closeButton>
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
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const username = Cookies.get('username');

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const groupId = await createGroup(groupName);
      navigate(`/group/${groupId}`);
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    }
  };

  return (
    <Container>
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <h1 className="mb-4">Welcome to Evenly</h1>
          {!username ? (
            <>
              <p className="mb-4">Please sign in to start splitting bills with friends</p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowUserModal(true)}
              >
                Sign In
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4">Create a new group to start splitting bills with friends</p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowModal(true)}
              >
                Create New Group
              </Button>
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateGroup}>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
      />
    </Container>
  );
};

export default HomePage;