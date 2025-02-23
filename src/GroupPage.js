import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { createReceipt, getGroupReceipts, getGroup, addMemberToGroup, updateMember, deleteMember, deleteReceipt } from './firebaseUtils';
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
  Tab
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const UserModal = ({ show, onHide, onSubmit, initialData = { name: '' }, mode = 'add' }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (initialData && initialData.name) {
      setUserName(initialData.name);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: userName });
    if (mode === 'add') {
      setUserName('');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'add' ? 'Add New User' : 'Edit User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>User Name</Form.Label>
            <Form.Control
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                onHide();
                if (mode === 'add') {
                  setUserName('');
                }
              }}
            >
              取消
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'add' ? 'Add' : 'Save'}
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

  useEffect(() => {
    const fetchInitialData = async () => {
      const groupData = await getGroup(groupId);
      setGroup(groupData);
    };
    fetchInitialData();

    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      const data = doc.data();
      if (data) {
        setGroup(data);
        fetchReceipts();
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
      await createReceipt(groupId, receiptData);
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

  const calculateReceiptTotal = (receipt) => {
    // Calculate subtotal
    const subtotal = receipt.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    
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

  if (!group) {
    return <div>Loading group data...</div>;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{group?.name || 'Loading...'}</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setIsShareModalOpen(true)}>
            <i className="bi bi-share me-2"></i>
            Share
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="receipts" title="Receipts">
          <div className="d-flex justify-content-end mb-3">
            <Button variant="success" onClick={() => setIsModalOpen(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Add Receipt
            </Button>
          </div>
          <Table hover responsive className="bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>Receipt Name</th>
                <th>Total Amount</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No receipts</td>
                </tr>
              ) : (
                receipts.map((receipt) => (
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
                    <td>{new Date(receipt.createdAt).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleDeleteReceipt(receipt.id, e)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
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
              <i className="bi bi-person-plus me-2"></i>
              Add User
            </Button>
          </div>
          <Table hover responsive className="bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>User Name</th>
                <th style={{ width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!group.members || group.members.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center">No users</td>
                </tr>
              ) : (
                group.members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditUserModal(member);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(member.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
            handleAddReceipt({ name: e.target.receiptName.value });
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
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" type="submit">
                添加
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
      />
    </Container>
  );
};

export default GroupPage;
