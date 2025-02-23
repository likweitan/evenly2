import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => {
  return (
    <div 
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: 'calc(100vh - 100px)' }} // Account for navbar height
    >
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner; 