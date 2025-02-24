import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { uploadReceiptImage, getReceiptImages, deleteReceiptImage } from '../supabaseConfig';

const AttachmentsTab = ({ receiptId }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/svg+xml'
  ];

  useEffect(() => {
    fetchImages();
  }, [receiptId]);

  const fetchImages = async () => {
    try {
      const imageList = await getReceiptImages(receiptId);
      setImages(imageList);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Please upload a valid image file');
      e.target.value = null;
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      e.target.value = null;
      return;
    }

    try {
      setUploading(true);
      await uploadReceiptImage(file, receiptId);
      await fetchImages();
      e.target.value = null;
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteReceiptImage(receiptId, fileName);
      await fetchImages();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="pt-3">
      {/* Show images first if they exist */}
      {images.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4 mb-4">
          {images.map((image, idx) => (
            <Col key={idx}>
              <Card className="position-relative">
                <div 
                  className="position-absolute top-0 end-0 m-2 z-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleDelete(image.name)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
                <Card.Img
                  variant="top"
                  src={image.url}
                  style={{ 
                    height: '200px', 
                    objectFit: 'cover', 
                    cursor: 'pointer',
                    borderRadius: 'calc(0.375rem - 1px)' // Match Card border radius
                  }}
                  onClick={() => {
                    setSelectedImage(image);
                    setShowPreview(true);
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Upload Area - Simplified when images exist */}
      <Card className={`border-2 border-dashed ${images.length > 0 ? 'mb-0' : 'mb-4'}`}>
        <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
          {images.length === 0 ? (
            <>
              <i className="bi bi-cloud-upload text-primary mb-3" style={{ fontSize: '2rem' }}></i>
              <p className="mb-3">Click or drag image here to upload</p>
              <small className="text-muted mb-3">
                Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF, SVG
              </small>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '1.2rem' }}></i>
              <span>Upload more images</span>
            </div>
          )}
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          {uploading && (
            <div className="mt-2 text-muted">
              <i className="bi bi-arrow-repeat spinner me-2"></i>
              Uploading...
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Receipt Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt="Receipt"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Add this CSS to your stylesheet
const styles = `
  .border-dashed {
    border-style: dashed !important;
  }

  .spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Add style tag to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AttachmentsTab; 