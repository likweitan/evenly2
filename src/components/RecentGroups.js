import React from 'react';
import { Link } from 'react-router-dom';
import { Card, ListGroup } from 'react-bootstrap';

const RecentGroups = () => {
  const recentGroups = JSON.parse(localStorage.getItem('recentGroups') || '[]');

  if (recentGroups.length === 0) return null;

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h6 className="mb-0">Recent Groups</h6>
      </Card.Header>
      <ListGroup variant="flush">
        {recentGroups.map(group => (
          <ListGroup.Item 
            key={group.id}
            action
            as={Link}
            to={`/group/${group.id}`}
            className="d-flex justify-content-between align-items-center"
          >
            <div>{group.name}</div>
            <small className="text-muted">
              {new Date(group.lastVisited).toLocaleDateString()}
            </small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default RecentGroups; 