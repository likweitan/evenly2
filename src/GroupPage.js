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

const UserModal = ({ show, onHide, onSubmit, initialData = { name: '' }, mode = 'add', onDelete, receipts, setReceipts, groupId }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (initialData && initialData.name) {
      setUserName(initialData.name);
    }
  }, [initialData]);

  // Add debounced update function
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

  // Get all items for this user
  const getUserItems = () => {
    // Check if we have valid initialData and we're in edit mode
    if (mode !== 'edit' || !initialData || !initialData.id) return [];

    const items = [];
    receipts.forEach(receipt => {
      receipt.items?.forEach((item, index) => {
        if (item.userIds && item.userIds.includes(initialData.id)) {
          items.push({
            ...item,
            receiptName: receipt.name,
            receiptId: receipt.id,
            itemIndex: index,
            isPaid: item.paidByIds && item.paidByIds.includes(initialData.id)
          });
        }
      });
    });
    return items;
  };

  const handlePaymentToggle = async (receiptId, itemIndex, currentPaidStatus) => {
    try {
      // Create a copy of all receipts
      const updatedReceipts = receipts.map(receipt => {
        if (receipt.id === receiptId) {
          const updatedItems = [...receipt.items];
          const item = { ...updatedItems[itemIndex] };
          
          let paidByIds = new Set(item.paidByIds || []);
          if (currentPaidStatus) {
            paidByIds.delete(initialData.id);
          } else {
            paidByIds.add(initialData.id);
          }
          
          item.paidByIds = Array.from(paidByIds);
          updatedItems[itemIndex] = item;

          return {
            ...receipt,
            items: updatedItems
          };
        }
        return receipt;
      });

      // Update Firebase
      const receipt = updatedReceipts.find(r => r.id === receiptId);
      await updateAllReceiptItems(receiptId, receipt.items);

      // Update local state
      setReceipts(updatedReceipts);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const userItems = getUserItems();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: userName });
    if (mode === 'add') {
      setUserName('');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'add' ? 'Add New User' : 'Edit User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
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

          {mode === 'edit' && userItems.length > 0 && (
            <div className="mt-4">
              <h6 className="mb-3">Items Consumed</h6>
              {/* Group items by receipt */}
              {Object.entries(
                userItems.reduce((acc, item) => {
                  if (!acc[item.receiptId]) {
                    acc[item.receiptId] = {
                      name: item.receiptName,
                      items: []
                    };
                  }
                  acc[item.receiptId].items.push(item);
                  return acc;
                }, {})
              ).map(([receiptId, receipt]) => (
                <div key={receiptId} className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="checkbox"
                      className="me-2"
                      checked={receipt.items.every(item => item.isPaid)}
                      onChange={(e) => {
                        // Handle bulk toggle for this receipt
                        const shouldMarkAsPaid = !receipt.items.every(item => item.isPaid);
                        receipt.items.forEach(item => {
                          handlePaymentToggle(
                            item.receiptId,
                            item.itemIndex,
                            !shouldMarkAsPaid  // Invert the current status
                          );
                        });
                      }}
                    />
                    <h6 className="mb-0 text-primary">{receipt.name}</h6>
                  </div>
                  <div className="ms-4">
                    {receipt.items.map((item, index) => {
                      const consumersCount = (item.userIds || []).length;
                      const perPersonCost = (item.price * item.quantity) / consumersCount;
                      
                      return (
                        <div 
                          key={index} 
                          className="d-flex justify-content-between align-items-center py-2 border-bottom"
                        >
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={item.isPaid}
                              onChange={() => handlePaymentToggle(item.receiptId, item.itemIndex, item.isPaid)}
                              className="me-3"
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-muted">
                            RM {perPersonCost.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'edit' && (
            <div className="mt-4">
              <Button 
                variant="outline-danger" 
                className="w-100"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this user?')) {
                    onDelete(initialData.id);
                  }
                }}
              >
                <i className="bi bi-trash me-2"></i>
                Delete User
              </Button>
            </div>
          )}
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
  const [activeTab, setActiveTab] = useState('receipts');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{group?.name || 'Loading...'}</h2>
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
        <Tab eventKey="receipts" title="Receipts">
          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex justify-content-end mb-3 gap-2">
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                <i className="bi bi-upload"></i>
              </Button>
              <Button variant="success" onClick={() => setIsModalOpen(true)}>
                <i className="bi bi-plus-lg"></i>
              </Button>
            </div>
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
                <th>Total Owed</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!group.members || group.members.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">No users</td>
                </tr>
              ) : (
                group.members.map((member) => {
                  const totalOwed = calculateUserTotalAmount(member.id, receipts);
                  
                  return (
                    <tr 
                      key={member.id} 
                      onClick={() => handleUserRowClick(member)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{member.name}</td>
                      <td>
                        <Badge bg={totalOwed > 0 ? "warning" : "success"}>
                          RM <CountUp
                            end={totalOwed}
                            decimals={2}
                            duration={0.75}
                          />
                        </Badge>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {totalOwed > 0 ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkUserPayment(member.id);
                            }}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Mark All Paid
                          </Button>
                        ) : (
                          <div className="text-success d-flex align-items-center justify-content-center">
                            <i className="bi bi-emoji-smile me-2"></i>
                            Thank you for paying!
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
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
