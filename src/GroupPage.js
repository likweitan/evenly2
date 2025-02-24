import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { createReceipt, getGroupReceipts, getGroup, addMemberToGroup, updateMember, deleteMember, deleteReceipt, deleteGroup, addItemToReceipt, updateReceiptTaxes, updateAllReceiptItems } from './firebaseUtils';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Container, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form,
  Badge,
  Tabs,
  Tab,
  Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingSpinner from './components/LoadingSpinner';
import CountUp from 'react-countup';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    cursor: 'pointer',
  },
  th: {
    backgroundColor: '#f2f2f2',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  userSection: {
    marginTop: '40px',
  },
  actionButton: {
    padding: '6px 12px',
    marginLeft: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '6px 12px',
    marginLeft: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  shareButton: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  shareTitle: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  linkContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  linkInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  copyButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

const AddReceiptModal = ({ isOpen, onClose, onSubmit }) => {
  const [receiptName, setReceiptName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: receiptName });
    setReceiptName('');
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>Add New Receipt</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Receipt Name:</label>
            <input
              style={styles.input}
              type="text"
              value={receiptName}
              onChange={(e) => setReceiptName(e.target.value)}
              placeholder="Enter receipt name"
              required
            />
          </div>
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: '#999'}}>
              取消
            </button>
            <button type="submit" style={styles.button}>
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserModal = ({ show, onHide, onSubmit, initialData = { name: '' }, mode = 'add', onDelete, receipts, setReceipts, groupId, group }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (initialData && initialData.name) {
      setUserName(initialData.name);
    }
  }, [initialData]);

  const handleNameChange = async (newName) => {
    setUserName(newName);
    if (mode === 'edit' && initialData.id) {
      try {
        await updateMember(groupId, initialData.id, { name: newName });
      } catch (error) {
        console.error('Failed to update user name:', error);
        alert('Failed to update user name');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: userName });
    if (mode === 'add') {
      setUserName('');
    }
  };

  const calculatePaymentDetails = () => {
    if (mode !== 'edit' || !initialData || !initialData.id) return [];

    const payments = {};

    receipts.forEach(receipt => {
      // Skip if receipt has no items
      if (!receipt.items) return;

      // Get the owner of this receipt
      const receiptOwner = receipt.paidTo;
      if (!receiptOwner) return;

      receipt.items.forEach(item => {
        // Skip if user is not a consumer or has already paid
        if (!item.userIds?.includes(initialData.id)) return;
        if (item.paidByIds?.includes(initialData.id)) return;

        const itemTotal = item.price * item.quantity;
        const perPersonShare = itemTotal / item.userIds.length;

        // Calculate share with taxes
        let shareWithTax = perPersonShare;
        if (receipt.sst) {
          shareWithTax += perPersonShare * (receipt.sst / 100);
        }
        if (receipt.serviceCharge) {
          shareWithTax += perPersonShare * (receipt.serviceCharge / 100);
        }

        // Add to owner's total
        if (!payments[receiptOwner]) {
          payments[receiptOwner] = {
            amount: 0,
            receiptNames: new Set()
          };
        }
        payments[receiptOwner].amount += shareWithTax;
        payments[receiptOwner].receiptNames.add(receipt.name);
      });
    });

    return Object.entries(payments).map(([ownerId, data]) => ({
      ownerId,
      amount: data.amount,
      receiptNames: Array.from(data.receiptNames)
    }));
  };

  const paymentDetails = calculatePaymentDetails();

  const handleMarkPaid = async (ownerId, receiptNames) => {
    try {
      const timestamp = new Date().toISOString();
      
      // Create a copy of receipts to update
      const updatedReceipts = receipts.map(receipt => {
        // Only update receipts in the payment record
        if (!receiptNames.includes(receipt.name)) return receipt;

        const updatedItems = receipt.items?.map(item => {
          // Only update items where the user is a consumer and hasn't paid
          if (item.userIds?.includes(initialData.id) && !item.paidByIds?.includes(initialData.id)) {
            return {
              ...item,
              paidByIds: [...(item.paidByIds || []), initialData.id],
              // Add or update paidTimestamp object
              paidTimestamp: {
                ...(item.paidTimestamp || {}),
                [initialData.id]: timestamp
              }
            };
          }
          return item;
        });

        return {
          ...receipt,
          items: updatedItems
        };
      });

      // Update Firebase for each modified receipt
      for (const receipt of updatedReceipts) {
        const originalReceipt = receipts.find(r => r.id === receipt.id);
        if (JSON.stringify(receipt.items) !== JSON.stringify(originalReceipt.items)) {
          await updateAllReceiptItems(receipt.id, receipt.items);
        }
      }

      // Update local state
      setReceipts(updatedReceipts);
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Failed to mark as paid');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'add' ? 'Add New User' : 'Edit User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>User Name</Form.Label>
            <Form.Control
              type="text"
              value={userName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter user name"
              required
            />
          </Form.Group>

          {mode === 'edit' && paymentDetails.length > 0 && (
            <div className="mt-4">
              <h6 className="mb-3">Payment Summary</h6>
              <div className="list-group">
                {paymentDetails.map(({ ownerId, amount, receiptNames }) => {
                  const ownerName = group.members.find(m => m.id === ownerId)?.name;
                  
                  return (
                    <div key={ownerId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <i className="bi bi-arrow-right me-2 text-primary"></i>
                          Pay to <strong>{ownerName}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="primary">
                            RM {amount.toFixed(2)}
                          </Badge>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleMarkPaid(ownerId, receiptNames)}
                            title="Mark all items as paid"
                          >
                            <i className="bi bi-check-circle"></i>
                          </Button>
                        </div>
                      </div>
                      <small className="text-muted d-block">
                        From receipts: {receiptNames.join(', ')}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            {mode === 'edit' ? (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={onDelete}
                type="button"
              >
                Delete User
              </Button>
            ) : (
              <div />
            )}
            <Button 
              variant="primary" 
              type="submit"
            >
              {mode === 'add' ? 'Add User' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const ShareModal = ({ show, onHide, groupId }) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const shareUrl = `${window.location.origin}/group/${groupId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share Group</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="bg-light p-3 rounded mb-3">
          <QRCodeSVG value={shareUrl} size={200} level="H" includeMargin={true} />
        </div>
        <div className="d-flex gap-2">
          <Form.Control type="text" value={shareUrl} readOnly />
          <Button variant="success" onClick={handleCopyLink}>
            {showCopiedMessage ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const DeleteGroupModal = ({ show, onHide, onConfirm, groupName }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Delete Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          Are you sure you want to delete <strong>{groupName}</strong>?
        </div>
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          This action cannot be undone. All receipts and data in this group will be permanently deleted.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete Group
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const GroupNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Container className="py-5 text-center">
      <div className="mb-4">
        <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
      </div>
      <h2 className="mb-4">Group Not Found</h2>
      <p className="text-muted mb-4">
        The group you're looking for doesn't exist or has been deleted.
      </p>
      <Button 
        variant="primary" 
        onClick={() => navigate('/')}
      >
        Return to Home
      </Button>
    </Container>
  );
};

const UploadReceiptModal = ({ show, onHide, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      setFile(file);
      setError('');
    } else {
      setError('Please select a valid JSON file');
      setFile(null);
    }
  };

  const handleJsonTextChange = (e) => {
    setJsonText(e.target.value);
    setError('');
  };

  const parseAndSubmitJson = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Get SST and service charge directly from the percentage fields
      const sst = data["SST(%)"];
      const serviceCharge = data["service_charge(%)"];

      onSubmit({
        name: data.store_name,
        items: data.items,
        sst: sst ? parseFloat(sst).toFixed(1) : null,  // Use direct percentage values
        serviceCharge: serviceCharge ? parseFloat(serviceCharge).toFixed(1) : null
      });
    } catch (error) {
      console.error('Parse error:', error);
      setError('Invalid JSON format');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (uploadMethod === 'file' && file) {
      const reader = new FileReader();
      reader.onload = (e) => parseAndSubmitJson(e.target.result);
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
    } else if (uploadMethod === 'paste' && jsonText.trim()) {
      parseAndSubmitJson(jsonText);
    } else {
      setError('Please provide JSON data');
    }
  };

  const handleModalHide = () => {
    setFile(null);
    setJsonText('');
    setError('');
    setUploadMethod('file');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleModalHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Upload Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Form.Group>
              <div className="d-flex gap-3 mb-3">
                <Form.Check
                  type="radio"
                  name="uploadMethod"
                  id="fileUpload"
                  label="Upload JSON File"
                  checked={uploadMethod === 'file'}
                  onChange={() => setUploadMethod('file')}
                />
                <Form.Check
                  type="radio"
                  name="uploadMethod"
                  id="jsonPaste"
                  label="Paste JSON"
                  checked={uploadMethod === 'paste'}
                  onChange={() => setUploadMethod('paste')}
                />
              </div>
            </Form.Group>

            {uploadMethod === 'file' ? (
              <Form.Group>
                <Form.Control
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="mb-3"
                />
                {file && (
                  <div className="text-success">
                    <i className="bi bi-check-circle me-2"></i>
                    File selected: {file.name}
                  </div>
                )}
              </Form.Group>
            ) : (
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={10}
                  placeholder="Paste your JSON here..."
                  value={jsonText}
                  onChange={handleJsonTextChange}
                  className="font-monospace"
                />
              </Form.Group>
            )}

            {error && (
              <Alert variant="danger" className="mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="primary" 
              type="submit"
              disabled={uploadMethod === 'file' ? !file : !jsonText.trim()}
            >
              Upload
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const calculateReceiptTotal = (receipt) => {
  // Calculate subtotal
  const subtotal = receipt.items?.reduce((total, item) => 
    total + (item.price * item.quantity), 0) || 0;
  
  let total = subtotal;

  // Add SST if exists
  if (receipt.sst) {
    total += subtotal * (receipt.sst / 100);
  }

  // Add service charge if exists
  if (receipt.serviceCharge) {
    total += subtotal * (receipt.serviceCharge / 100);
  }

  return total;
};

const calculateGroupInsights = (receipts, members) => {
  const insights = {
    totalAmount: 0,
    receiptCount: receipts.length,
    recentActivity: receipts[0]?.createdAt,
    memberCount: members?.length || 0,
    highestReceipt: {
      name: '',
      amount: 0
    }
  };

  receipts.forEach(receipt => {
    const total = calculateReceiptTotal(receipt);
    insights.totalAmount += total;

    if (total > insights.highestReceipt.amount) {
      insights.highestReceipt = {
        name: receipt.name,
        amount: total
      };
    }
  });

  return insights;
};

// Add this function to calculate paid bills percentage
const calculatePaidPercentage = (receipts) => {
  if (!receipts.length) return 0;
  
  let totalPaidItems = 0;
  let totalItems = 0;

  receipts.forEach(receipt => {
    if (!receipt.items) return;
    
    receipt.items.forEach(item => {
      totalItems++;
      // Check if all consumers (except owner) have paid
      const consumersExcludingOwner = (item.userIds || [])
        .filter(id => id !== receipt.paidTo);
      const payersExcludingOwner = (item.paidByIds || [])
        .filter(id => id !== receipt.paidTo);
      
      if (consumersExcludingOwner.length > 0 && 
          payersExcludingOwner.length > 0 && 
          consumersExcludingOwner.length === payersExcludingOwner.length && 
          consumersExcludingOwner.every(id => payersExcludingOwner.includes(id))) {
        totalPaidItems++;
      }
    });
  });

  return totalItems ? (totalPaidItems / totalItems) * 100 : 0;
};

// Add this function to calculate total amount for a user across all receipts
const calculateUserTotalAmount = (userId, receipts) => {
  let totalAmount = 0;
  
  receipts.forEach(receipt => {
    if (!receipt.items) return;

    receipt.items.forEach(item => {
      if (item.userIds && item.userIds.includes(userId)) {
        // Calculate base amount for this item
        const itemTotal = item.price * item.quantity;
        
        // Get number of consumers (excluding owner)
        const consumersCount = (item.userIds || [])
          .filter(id => id !== receipt.paidTo)
          .length;
        
        // Calculate per person share
        const perPersonShare = consumersCount > 0 ? itemTotal / consumersCount : 0;
        
        // Calculate total with taxes for this person's share
        let perPersonTotal = perPersonShare;
        if (receipt.sst) {
          perPersonTotal += perPersonShare * (receipt.sst / 100);
        }
        if (receipt.serviceCharge) {
          perPersonTotal += perPersonShare * (receipt.serviceCharge / 100);
        }

        // Deduct if this person has paid for their share
        if (item.paidByIds && item.paidByIds.includes(userId)) {
          perPersonTotal = 0;
        }

        totalAmount += perPersonTotal;
      }
    });
  });

  return totalAmount;
};

// First, add a copy function helper
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // Could add a toast notification here
  });
};

// Add this function at the top level
const addToRecentGroups = (groupId, groupName) => {
  try {
    // Get existing recent groups
    const recentGroups = JSON.parse(localStorage.getItem('recentGroups') || '[]');
    
    // Remove if already exists (to move it to top)
    const filteredGroups = recentGroups.filter(group => group.id !== groupId);
    
    // Add to beginning of array
    filteredGroups.unshift({
      id: groupId,
      name: groupName,
      lastVisited: new Date().toISOString()
    });

    // Keep only last 10 groups
    const updatedGroups = filteredGroups.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('recentGroups', JSON.stringify(updatedGroups));
  } catch (error) {
    console.error('Failed to save recent group:', error);
  }
};

const PaymentSummaryTab = ({ group, receipts, setReceipts }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleMarkAllPaid = async (payerId) => {
    if (!window.confirm('Are you sure you want to mark all items as paid for this user?')) return;

    try {
      const timestamp = new Date().toISOString();
      
      // Create a copy of receipts to update
      const updatedReceipts = receipts.map(receipt => {
        const updatedItems = receipt.items?.map(item => {
          // Only update items where the user is a consumer and hasn't paid
          if (item.userIds?.includes(payerId) && !item.paidByIds?.includes(payerId)) {
            return {
              ...item,
              paidByIds: [...(item.paidByIds || []), payerId],
              // Add or update paidTimestamp object
              paidTimestamp: {
                ...(item.paidTimestamp || {}),
                [payerId]: timestamp
              }
            };
          }
          return item;
        });

        return {
          ...receipt,
          items: updatedItems
        };
      });

      // Update Firebase for each modified receipt
      for (const receipt of updatedReceipts) {
        const originalReceipt = receipts.find(r => r.id === receipt.id);
        if (JSON.stringify(receipt.items) !== JSON.stringify(originalReceipt.items)) {
          await updateAllReceiptItems(receipt.id, receipt.items);
        }
      }

      // Update local state
      setReceipts(updatedReceipts);
    } catch (error) {
      console.error('Failed to mark all as paid:', error);
      alert('Failed to mark all as paid');
    }
  };

  // Group all payments by payer
  const calculatePayments = () => {
    const payerGroups = {};

    receipts.forEach(receipt => {
      receipt.items?.forEach(item => {
        // Skip if user is the owner of this receipt
        if (receipt.paidTo === item.userIds) return;

        const itemTotal = item.price * item.quantity;
        // Calculate share only among non-owner consumers
        const nonOwnerConsumers = item.userIds?.filter(id => id !== receipt.paidTo) || [];
        const perPersonShare = itemTotal / (nonOwnerConsumers.length || 1);

        // Calculate share with taxes
        let shareWithTax = perPersonShare;
        if (receipt.sst) {
          shareWithTax += perPersonShare * (receipt.sst / 100);
        }
        if (receipt.serviceCharge) {
          shareWithTax += perPersonShare * (receipt.serviceCharge / 100);
        }

        // For each consumer who hasn't paid (excluding owner)
        nonOwnerConsumers.forEach(userId => {
          if (!item.paidByIds?.includes(userId)) {
            if (!payerGroups[userId]) {
              payerGroups[userId] = {
                payerId: userId,
                totalAmount: 0,
                payments: {}
              };
            }

            const key = receipt.paidTo;
            if (!payerGroups[userId].payments[key]) {
              payerGroups[userId].payments[key] = {
                recipientId: key,
                amount: 0,
                items: [] // Track individual items
              };
            }

            payerGroups[userId].payments[key].amount += shareWithTax;
            payerGroups[userId].payments[key].items.push({
              receiptName: receipt.name,
              itemName: item.name,
              price: item.price,
              quantity: item.quantity,
              share: shareWithTax,
              totalConsumers: nonOwnerConsumers.length
            });
            payerGroups[userId].totalAmount += shareWithTax;
          }
        });
      });
    });

    return Object.values(payerGroups).map(group => ({
      ...group,
      payments: Object.values(group.payments)
    }));
  };

  const PaymentDetailsModal = ({ show, onHide, payment, payer, recipient }) => {
    // Add early return if payment is null
    if (!payment) return null;

    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>From: <strong>{payer || 'Unknown'}</strong></h6>
            <h6>To: <strong>{recipient || 'Unknown'}</strong></h6>
            <h6>Total Amount: <strong>RM {payment.amount.toFixed(2)}</strong></h6>
          </div>

          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Split Among</th>
                  <th>Your Share</th>
                </tr>
              </thead>
              <tbody>
                {payment.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.receiptName}</td>
                    <td>{item.itemName}</td>
                    <td>RM {item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.totalConsumers} people</td>
                    <td>RM {item.share.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  const paymentGroups = calculatePayments();

  return (
    <div className="pt-3">
      {paymentGroups.map((payerGroup) => {
        const payer = group.members?.find(m => m.id === payerGroup.payerId)?.name;

        return (
          <Card key={payerGroup.payerId} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{payer || 'Unknown User'}</h6>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="primary">
                  Total: RM {payerGroup.totalAmount.toFixed(2)}
                </Badge>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleMarkAllPaid(payerGroup.payerId)}
                  title="Mark all as paid"
                >
                  <i className="bi bi-check-circle"></i>
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                {payerGroup.payments.map((payment, index) => {
                  const recipient = group.members?.find(m => m.id === payment.recipientId)?.name;

                  return (
                    <div 
                      key={index} 
                      className="list-group-item" 
                      onClick={() => {
                        setSelectedPayment({
                          ...payment,
                          payerName: payer,
                          recipientName: recipient
                        });
                        setShowDetailsModal(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-arrow-right me-2 text-primary"></i>
                          Pay to <strong>{recipient || 'Unknown User'}</strong>
                        </div>
                        <Badge bg="primary">
                          RM {payment.amount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* Only render modal if selectedPayment exists */}
      {selectedPayment && (
        <PaymentDetailsModal
          show={showDetailsModal}
          onHide={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          payer={selectedPayment.payerName}
          recipient={selectedPayment.recipientName}
        />
      )}

      {paymentGroups.length === 0 && (
        <div className="text-center text-muted py-4">
          No pending payments
        </div>
      )}
    </div>
  );
};

const PaymentHistoryTab = ({ group, receipts, setReceipts }) => {
  const calculatePaidHistory = () => {
    const historyMap = new Map(); // Use Map to consolidate by receipt

    receipts.forEach(receipt => {
      receipt.items?.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const perPersonShare = itemTotal / (item.userIds?.length || 1);

        // Calculate share with taxes
        let shareWithTax = perPersonShare;
        if (receipt.sst) {
          shareWithTax += perPersonShare * (receipt.sst / 100);
        }
        if (receipt.serviceCharge) {
          shareWithTax += perPersonShare * (receipt.serviceCharge / 100);
        }

        // For each consumer who has paid
        item.paidByIds?.forEach(payerId => {
          const key = `${receipt.id}-${payerId}`; // Create unique key for receipt-payer combination
          
          if (!historyMap.has(key)) {
            historyMap.set(key, {
              payerId,
              recipientId: receipt.paidTo,
              receiptId: receipt.id,
              receiptName: receipt.name,
              amount: 0,
              items: [],
              // Use the latest timestamp from all items
              timestamp: item.paidTimestamp?.[payerId] || new Date().toISOString()
            });
          }

          const record = historyMap.get(key);
          record.amount += shareWithTax;
          record.items.push({
            name: item.name,
            share: shareWithTax,
            timestamp: item.paidTimestamp?.[payerId]
          });

          // Update timestamp if this item was paid later
          if (item.paidTimestamp?.[payerId] > record.timestamp) {
            record.timestamp = item.paidTimestamp[payerId];
          }
        });
      });
    });

    // Convert Map to array and sort by timestamp
    return Array.from(historyMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUndoPayment = async (payment) => {
    if (!window.confirm('Are you sure you want to undo all payments for this receipt?')) return;

    try {
      const updatedReceipts = receipts.map(receipt => {
        if (receipt.id !== payment.receiptId) return receipt;

        const updatedItems = receipt.items.map(item => {
          // Remove the payer from all items in this receipt
          const newPaidByIds = (item.paidByIds || []).filter(id => id !== payment.payerId);
          const newPaidTimestamp = { ...(item.paidTimestamp || {}) };
          delete newPaidTimestamp[payment.payerId];

          return {
            ...item,
            paidByIds: newPaidByIds,
            paidTimestamp: newPaidTimestamp
          };
        });

        return {
          ...receipt,
          items: updatedItems
        };
      });

      const receipt = updatedReceipts.find(r => r.id === payment.receiptId);
      await updateAllReceiptItems(payment.receiptId, receipt.items);
      setReceipts(updatedReceipts);
    } catch (error) {
      console.error('Failed to undo payment:', error);
      alert('Failed to undo payment');
    }
  };

  const history = calculatePaidHistory();

  return (
    <div className="pt-3">
      <div className="list-group">
        {history.map((payment, index) => {
          const payer = group.members.find(m => m.id === payment.payerId)?.name;
          const recipient = group.members.find(m => m.id === payment.recipientId)?.name;

          return (
            <div key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>{payer}</strong>
                  <i className="bi bi-arrow-right mx-2 text-success"></i>
                  <strong>{recipient}</strong>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="success">
                    RM {payment.amount.toFixed(2)}
                  </Badge>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleUndoPayment(payment)}
                    title="Undo all payments for this receipt"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </Button>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  <i className="bi bi-receipt me-2"></i>
                  {payment.receiptName}
                  <small className="ms-2 text-muted">
                    ({payment.items.length} items)
                  </small>
                </div>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {formatDateTime(payment.timestamp)}
                </small>
              </div>
            </div>
          );
        })}
        {history.length === 0 && (
          <div className="text-center text-muted py-4">
            No payment history
          </div>
        )}
      </div>
    </div>
  );
};

const GroupPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const groupData = await getGroup(groupId);
        if (!groupData) {
          setError(true);
          return;
        }
        setGroup(groupData);
        // Add to recent groups when data is loaded
        addToRecentGroups(groupId, groupData.name);
      } catch (error) {
        console.error('Failed to fetch group:', error);
        setError(true);
      }
    };
    fetchInitialData();

    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      const data = doc.data();
      if (data) {
        setGroup(data);
        fetchReceipts();
      } else {
        setError(true);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  const fetchReceipts = async () => {
    const groupReceipts = await getGroupReceipts(groupId);
    setReceipts(groupReceipts);
  };

  const handleAddReceipt = async (receiptData) => {
    try {
      await createReceipt(groupId, {
        name: receiptData.name,
        paidTo: receiptData.paidTo
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add receipt:', error);
      alert('Failed to add receipt');
    }
  };

  const handleReceiptClick = (receiptId) => {
    navigate(`/group/${groupId}/receipt/${receiptId}`);
  };

  const handleAddUser = async (userData) => {
    try {
      await addMemberToGroup(groupId, userData);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await updateMember(groupId, selectedUser.id, userData);
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteMember(groupId, userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const openEditUserModal = (user) => {
    if (user && user.id) {
      setSelectedUser(user);
      setUserModalMode('edit');
      setIsUserModalOpen(true);
    }
  };

  const handleDeleteReceipt = async (receiptId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await deleteReceipt(groupId, receiptId);
      } catch (error) {
        console.error('Failed to delete receipt:', error);
        alert('Failed to delete receipt');
      }
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(groupId);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group');
    }
  };

  const handleUploadReceipt = async (receiptData) => {
    try {
      // Create receipt and get the receiptId
      const receiptId = await createReceipt(groupId, {
        name: receiptData.name,
        paidTo: group.members[0]?.id // Default to first member
      });

      // Add all items from the JSON
      for (const item of receiptData.items) {
        await addItemToReceipt(receiptId, {
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      }

      // Update tax settings
      if (receiptData.sst || receiptData.serviceCharge) {
        await updateReceiptTaxes(receiptId, {
          sst: receiptData.sst,
          serviceCharge: receiptData.serviceCharge
        });
      }

      // Fetch updated receipts
      await fetchReceipts();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      alert('Failed to upload receipt');
    }
  };

  // Add this function to handle item click
  const handleUserRowClick = (member) => {
    openEditUserModal(member);
  };

  const handleBulkUserPayment = async (userId) => {
    if (!window.confirm('This will mark all items consumed by this user as paid. This action cannot be undone. Continue?')) {
      return;
    }

    try {
      // Create a copy of receipts to update locally
      const updatedReceipts = receipts.map(receipt => {
        if (!receipt.items) return receipt;

        const updatedItems = receipt.items.map(item => {
          // Only update items where the user is a consumer
          if (item.userIds && item.userIds.includes(userId)) {
            const paidByIds = new Set(item.paidByIds || []);
            paidByIds.add(userId);
            return {
              ...item,
              paidByIds: Array.from(paidByIds)
            };
          }
          return item;
        });

        // Return updated receipt
        return {
          ...receipt,
          items: updatedItems
        };
      });

      // Update Firebase for each modified receipt
      for (const receipt of updatedReceipts) {
        const originalReceipt = receipts.find(r => r.id === receipt.id);
        if (JSON.stringify(receipt.items) !== JSON.stringify(originalReceipt.items)) {
          await updateAllReceiptItems(receipt.id, receipt.items);
        }
      }

      // Update local state immediately
      setReceipts(updatedReceipts);

    } catch (error) {
      console.error('Failed to update payments:', error);
      alert('Failed to update payments');
    }
  };

  if (error) {
    return <GroupNotFound />;
  }

  if (!group) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
    <div>
          <h2 className="mb-2">{group?.name || 'Loading...'}</h2>
          <div className="d-flex align-items-center gap-2">
            <code className="text-muted">{groupId}</code>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setIsShareModalOpen(true)}>
            <i className="bi bi-share"></i>
          </Button>
          <Button 
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-cash text-success me-2"></i>
                <h6 className="mb-0">Total Spent</h6>
              </div>
              <h3 className="mb-0">
                RM <CountUp
                  end={calculateGroupInsights(receipts, group.members).totalAmount}
                  decimals={2}
                  duration={1}
                />
              </h3>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                <h6 className="mb-0">Paid Items</h6>
              </div>
              <h3 className="mb-0">
                <CountUp
                  end={calculatePaidPercentage(receipts)}
                  decimals={1}
                  duration={1}
                  suffix="%"
                />
              </h3>
              <div className="mt-2">
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ 
                      width: `${calculatePaidPercentage(receipts)}%`,
                      transition: 'width 1s ease-in-out'
                    }} 
                    aria-valuenow={calculatePaidPercentage(receipts)} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  />
                </div>
              </div>
              <small className="text-muted d-block mt-2">
                of all items have been paid
              </small>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="summary" title="Summary">
          <PaymentSummaryTab 
            group={group}
            receipts={receipts}
            setReceipts={setReceipts}
          />
        </Tab>

        <Tab eventKey="receipts" title="Receipts">
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant="success"
              onClick={() => setIsModalOpen(true)}
              className="me-2"
            >
              <i className="bi bi-plus-lg"></i>
            </Button>
            <Button 
              variant="outline-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <i className="bi bi-upload"></i>
            </Button>
          </div>
          <Table hover responsive className="bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>Receipt Name</th>
                <th>Total Amount</th>
                <th>Paid To</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">No receipts</td>
                </tr>
              ) : (
                receipts.map((receipt) => {
                  // Find the user name for paidTo
                  const paidToUser = group.members?.find(member => member.id === receipt.paidTo);
                  
                  return (
                    <tr 
                      key={receipt.id} 
                      onClick={() => handleReceiptClick(receipt.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{receipt.name}</td>
                      <td>
                        <Badge bg="info">
                          RM {calculateReceiptTotal(receipt).toFixed(2)}
                        </Badge>
                      </td>
                      <td>
                        {paidToUser ? (
                          <Badge bg="primary">
                            {paidToUser.name}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Unassigned</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="users" title="Users">
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant="success"
              onClick={(e) => {
                e.stopPropagation();
                setUserModalMode('add');
                setSelectedUser(null);
                setIsUserModalOpen(true);
              }}
            >
              <i className="bi bi-person-plus"></i>
            </Button>
          </div>
          <Table hover responsive className="bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>User Name</th>
              </tr>
            </thead>
            <tbody>
              {!group.members || group.members.length === 0 ? (
                <tr>
                  <td className="text-center">No users</td>
                </tr>
              ) : (
                group.members.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => handleUserRowClick(member)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{member.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="history" title="History">
          <PaymentHistoryTab 
            group={group}
            receipts={receipts}
            setReceipts={setReceipts}
          />
        </Tab>
      </Tabs>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleAddReceipt({
              name: e.target.receiptName.value,
              paidTo: e.target.paidTo.value
            });
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Receipt Name</Form.Label>
              <Form.Control
                type="text"
                name="receiptName"
                placeholder="Enter receipt name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Paid To</Form.Label>
              <Form.Select
                name="paidTo"
                required
              >
                <option value="">Select user</option>
                {group.members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="primary" type="submit">
                Create
              </Button>
    </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ShareModal
        show={isShareModalOpen}
        onHide={() => setIsShareModalOpen(false)}
        groupId={groupId}
      />

      <UserModal
        show={isUserModalOpen}
        onHide={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={userModalMode === 'add' ? handleAddUser : handleEditUser}
        initialData={selectedUser}
        mode={userModalMode}
        onDelete={handleDeleteUser}
        receipts={receipts}
        setReceipts={setReceipts}
        groupId={groupId}
        group={group}
      />

      <DeleteGroupModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteGroup}
        groupName={group?.name}
      />

      <UploadReceiptModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        onSubmit={handleUploadReceipt}
      />
    </Container>
  );
};

export default GroupPage;
