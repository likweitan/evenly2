import React, { useState } from 'react';
import { Container, Card, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createGroup } from './firebaseUtils';

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

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
          <h1 className="mb-4">Welcome to Split Bill</h1>
          <p className="mb-4">Create a new group to start splitting bills with friends</p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setShowModal(true)}
          >
            Create New Group
          </Button>
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
    </Container>
  );
};

export default HomePage;