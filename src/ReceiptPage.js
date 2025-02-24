import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  getReceipt, 
  addItemToReceipt, 
  getGroup, 
  updateItemUsers, 
  deleteReceiptItem,
  updateReceiptTaxes,
  updateReceiptItem,
  updateReceiptSettings,
  deleteReceipt
} from './firebaseUtils';
import { 
  Container, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Badge,
  Row,
  Col,
  Breadcrumb,
  Tab,
  Tabs,
  Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingSpinner from './components/LoadingSpinner';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100%',
  },
  actionButton: {
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#d32f2f'
    }
  },
  editButton: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  summary: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '20px',
    gap: '30px',
  },
  summaryValue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  summaryLabel: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '4px',
  },
  summaryAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#2196F3',
  },
  itemCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  itemHeader: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  itemDetails: {
    padding: '12px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  itemLabel: {
    color: '#666',
    fontSize: '14px',
  },
  itemValue: {
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  floatingButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    whiteSpace: 'nowrap',
    minWidth: '800px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
    fontWeight: '600',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  buttonIcon: {
    fontSize: '16px',
    color: 'white',
  },
  userSummaryCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #eee',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  userSummaryHeader: {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  userTotal: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  userItemList: {
    padding: '12px 16px',
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  userItemDetails: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  userItemShare: {
    color: '#666',
    fontSize: '14px',
  },
  taxDetails: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #eee',
  },
  taxItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#666',
    fontSize: '14px',
    marginBottom: '4px',
  },
  accordion: {
    marginTop: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  accordionHeader: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
  },
  accordionContent: {
    padding: '15px',
    backgroundColor: 'white',
  },
  dateText: {
    color: '#666',
    fontSize: '14px',
  },
  modalDate: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '20px',
    marginTop: '-10px',
  },
};

// Replace the existing MultiSelect component with this new design
const UserSelect = ({ value, onChange, options, label }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      backgroundColor: 'white',
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{label}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {options.map(option => (
          <div
            key={option.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: value.includes(option.id) ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
            onClick={() => {
              const newValue = value.includes(option.id)
                ? value.filter(id => id !== option.id)
                : [...value, option.id];
              onChange(newValue);
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid #2196F3',
                borderRadius: '4px',
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: value.includes(option.id) ? '#2196F3' : 'white',
              }}
            >
              {value.includes(option.id) && (
                <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
              )}
            </div>
            {option.name}
          </div>
        ))}
        {options.length === 0 && (
          <div style={{ color: '#666', padding: '8px', gridColumn: '1 / -1' }}>
            No users available
          </div>
        )}
      </div>
    </div>
  );
};

const AddItemModal = ({ show, onHide, onSubmit, users }) => {
  const [item, setItem] = useState({
    name: '',
    price: '',
    quantity: '',
    userIds: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const handleUsersChange = (userIds) => {
    setItem(prev => ({ ...prev, userIds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item);
    setItem({ name: '', price: '', quantity: '', userIds: [] });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={item.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <UserSelect
              label="Select Users (Optional)"
              value={item.userIds}
              onChange={handleUsersChange}
              options={users}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const ChangeUserModal = ({ isOpen, onClose, onSubmit, users, itemId, currentUserIds = [] }) => {
  const [userIds, setUserIds] = useState([]);

  useEffect(() => {
    setUserIds(currentUserIds || []);
  }, [currentUserIds]);

  useEffect(() => {
    if (!isOpen) {
      setUserIds([]);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(itemId, userIds);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>Change Users</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <UserSelect
              label="Select Users (Optional)"
              value={userIds}
              onChange={(newUserIds) => {
                console.log('Selected users:', newUserIds);
                setUserIds(newUserIds);
              }}
              options={users}
            />
          </div>
          <div style={styles.modalButtons}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{...styles.button, backgroundColor: '#999'}}
            >
              Cancel
            </button>
            <button type="submit" style={styles.button}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceiptSummary = ({ receipt, items, calculateSubtotal, calculateTaxes }) => {
  const subtotal = calculateSubtotal(items);
  const taxes = calculateTaxes(subtotal, receipt);

  return (
    <div style={styles.summaryHeader}>
      <div style={styles.summaryValue}>
        <span style={styles.summaryLabel}>Subtotal</span>
        <span style={styles.summaryAmount}>
          RM {subtotal.toFixed(2)}
        </span>
      </div>
      {receipt.sst && (
        <div style={styles.summaryValue}>
          <span style={styles.summaryLabel}>SST ({receipt.sst}%)</span>
          <span style={styles.summaryAmount}>
            RM {taxes.sst.toFixed(2)}
          </span>
        </div>
      )}
      {receipt.serviceCharge && (
        <div style={styles.summaryValue}>
          <span style={styles.summaryLabel}>Service Charge ({receipt.serviceCharge}%)</span>
          <span style={styles.summaryAmount}>
            RM {taxes.serviceCharge.toFixed(2)}
          </span>
        </div>
      )}
      <div style={styles.summaryValue}>
        <span style={styles.summaryLabel}>Total</span>
        <span style={{...styles.summaryAmount, ...styles.totalAmount}}>
          RM {taxes.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const UserSummary = ({ users, items, receipt }) => {
  const calculateUserSubtotal = (userId) => {
    let subtotal = 0;
    items.forEach(item => {
      if (item.userIds && item.userIds.includes(userId)) {
        const perPersonCost = (item.price * item.quantity) / item.userIds.length;
        subtotal += perPersonCost;
      }
    });
    return subtotal;
  };

  const calculateUserTotal = (userId) => {
    // If this is the receipt owner (paidTo), they don't owe anything
    if (userId === receipt.paidTo) {
      return 0;
    }

    const subtotal = calculateUserSubtotal(userId);
    let total = subtotal;

    // Add tax and service charge if applicable
    if (total > 0) {
      if (receipt.sst) {
        total += total * (receipt.sst / 100);
      }
      if (receipt.serviceCharge) {
        total += total * (receipt.serviceCharge / 100);
      }
    }

    return total;
  };

  const getUserItems = (userId) => {
    return items.filter(item => 
      item.userIds && item.userIds.includes(userId)
    ).map(item => ({
      ...item,
      perPersonCost: (item.price * item.quantity) / item.userIds.length
    }));
  };

  const calculateUserPayments = (userId) => {
    // If this is the receipt owner (paidTo), they paid the total amount
    if (userId === receipt.paidTo) {
      const totalAmount = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      let total = totalAmount;
      if (receipt.sst) {
        total += totalAmount * (receipt.sst / 100);
      }
      if (receipt.serviceCharge) {
        total += totalAmount * (receipt.serviceCharge / 100);
      }
      return total;
    }

    let paid = 0;
    items.forEach(item => {
      if (item.paidByIds && item.paidByIds.includes(userId)) {
        const perPersonPaid = (item.price * item.quantity) / item.paidByIds.length;
        paid += perPersonPaid;
      }
    });
    return paid;
  };

  return (
    <>
      {users.map(user => {
        const userItems = getUserItems(user.id);
        const subtotal = calculateUserSubtotal(user.id);
        const total = calculateUserTotal(user.id);
        const paid = calculateUserPayments(user.id);
        
        const shouldShow = userItems.length > 0 || user.id === receipt.paidTo;
        if (!shouldShow) return null;

        return (
          <div key={user.id} className="mb-4">
            <div className="bg-white rounded shadow-sm">
              <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  {user.name}
                  {user.id === receipt.paidTo && (
                    <Badge bg="primary" className="ms-2">Owner</Badge>
                  )}
                </span>
                <div className="text-end">
                  <div className="text-muted small">Paid: RM {paid.toFixed(2)}</div>
                  <div className="text-primary fw-bold">Owed: RM {total.toFixed(2)}</div>
                </div>
              </div>
              <div className="p-3">
                {userItems.map((item, index) => {
                  const splitCount = item.userIds
                    .filter(id => id !== receipt.paidTo)
                    .length;

                  return (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <span>{item.name}</span>
                        {splitCount > 1 && (
                          <small className="text-muted ms-2">
                            (Split by {splitCount} persons)
                          </small>
                        )}
                      </div>
                      <span>RM {item.perPersonCost.toFixed(2)}</span>
                    </div>
                  );
                })}

                {/* Always show subtotal and taxes if there are items */}
                {userItems.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Subtotal</span>
                      <span>RM {subtotal.toFixed(2)}</span>
                    </div>
                    {receipt.sst && (
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>SST ({receipt.sst}%)</span>
                        <span>RM {(subtotal * receipt.sst / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {receipt.serviceCharge && (
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Service Charge ({receipt.serviceCharge}%)</span>
                        <span>RM {(subtotal * receipt.serviceCharge / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold small mt-2">
                      <span>Total</span>
                      <span>RM {(user.id === receipt.paidTo ? subtotal : total).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const ReceiptSettingsModal = ({ show, onHide, onSubmit, onDelete, initialData, users }) => {
  const [settings, setSettings] = useState({
    name: '',
    paidTo: '',
    sst: '',
    serviceCharge: ''
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSettings({
        name: initialData.name || '',
        paidTo: initialData.paidTo || '',
        sst: initialData.sst || '',
        serviceCharge: initialData.serviceCharge || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(settings);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Receipt Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Receipt Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Paid To</Form.Label>
              <Form.Select
                name="paidTo"
                value={settings.paidTo}
                onChange={(e) => setSettings(prev => ({ ...prev, paidTo: e.target.value }))}
                required
              >
                <option value="">Select user</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr className="my-4" />

            <Form.Group className="mb-3">
              <Form.Label>SST (%)</Form.Label>
              <Form.Control
                type="number"
                name="sst"
                value={settings.sst}
                onChange={(e) => setSettings(prev => ({ ...prev, sst: e.target.value }))}
                step="0.1"
                min="0"
                max="100"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Service Charge (%)</Form.Label>
              <Form.Control
                type="number"
                name="serviceCharge"
                value={settings.serviceCharge}
                onChange={(e) => setSettings(prev => ({ ...prev, serviceCharge: e.target.value }))}
                step="0.1"
                min="0"
                max="100"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-danger" 
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete Receipt
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this receipt?</p>
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            This action cannot be undone. All items and data in this receipt will be permanently deleted.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
          >
            Delete Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateReceiptPaidPercentage = (receipt) => {
  if (!receipt.items || !receipt.items.length) return 0;
  
  let totalPaidItems = 0;
  let totalItems = receipt.items.length;

  receipt.items.forEach(item => {
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

  return (totalPaidItems / totalItems) * 100;
};

const ReceiptPage = () => {
  const { groupId, receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [group, setGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeUserModalOpen, setIsChangeUserModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const groupData = await getGroup(groupId);
      setGroup(groupData);
    };
    fetchData();

    const unsubscribe = onSnapshot(doc(db, 'receipts', receiptId), (doc) => {
      setReceipt(doc.data());
    });

    return () => unsubscribe();
  }, [groupId, receiptId]);

  const handleAddItem = async (itemData) => {
    try {
      await addItemToReceipt(receiptId, itemData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  const handleChangeUser = async (itemId, userIds) => {
    try {
      console.log('Updating item', itemId, 'with users:', userIds);
      await updateItemUsers(receiptId, itemId, userIds);
      setIsChangeUserModalOpen(false);
      setSelectedItemId(null);
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Failed to change users:', error);
      alert('Failed to change users');
    }
  };

  const openChangeUserModal = (itemIndex, userIds) => {
    setSelectedItemId(itemIndex);
    setSelectedUserIds(userIds || []);
    setIsChangeUserModalOpen(true);
  };

  const handleDeleteItem = async (itemIndex) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteReceiptItem(receiptId, itemIndex);
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const calculateSubtotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTaxes = (subtotal, receipt) => {
    const taxes = {
      subtotal,
      sst: receipt.sst ? (subtotal * (receipt.sst / 100)) : null,
      serviceCharge: receipt.serviceCharge ? (subtotal * (receipt.serviceCharge / 100)) : null,
      total: subtotal
    };

    if (taxes.sst) {
      taxes.total += taxes.sst;
    }
    if (taxes.serviceCharge) {
      taxes.total += taxes.serviceCharge;
    }

    return taxes;
  };

  const handleTaxUpdate = async (taxData) => {
    try {
      await updateReceiptTaxes(receiptId, taxData);
      setIsTaxModalOpen(false);
    } catch (error) {
      console.error('Failed to update taxes:', error);
      alert('Failed to update taxes');
    }
  };

  const handleItemClick = (item, index, e) => {
    if (e.target.closest('button')) return;
    
    console.log('Selected item:', item); // Debug log
    setSelectedItem({ 
      ...item, 
      index,
      timestamp: item.updatedAt || item.createdAt,
    });
    setIsEditModalOpen(true);
  };

  const handleEditItem = async (itemData) => {
    try {
      // Create a clean item object with all required fields
      const updatedItem = {
        name: itemData.name,
        price: Number(itemData.price),
        quantity: Number(itemData.quantity),
        userIds: itemData.userIds || [],
        paidByIds: itemData.paidByIds || [],
        updatedAt: new Date().toISOString(),
      };

      if (itemData.isDelete) {
        await deleteReceiptItem(receiptId, itemData.index);
      } else if (itemData.isCopy) {
        // For copy, use addItemToReceipt with clean data
        await addItemToReceipt(receiptId, updatedItem);
      } else {
        // For update, use updateReceiptItem with clean data
        await updateReceiptItem(receiptId, selectedItem.index, updatedItem);
      }

      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  const handleSettingsUpdate = async (settingsData) => {
    try {
      await updateReceiptSettings(receiptId, settingsData);
      setIsTaxModalOpen(false);
    } catch (error) {
      console.error('Failed to update receipt settings:', error);
      alert('Failed to update receipt settings');
    }
  };

  const handleDeleteReceipt = async () => {
    try {
      await deleteReceipt(groupId, receiptId);
      navigate(`/group/${groupId}`);
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      alert('Failed to delete receipt');
    }
  };

  if (!receipt || !group) {
    return <LoadingSpinner />;
  }

  const getUserNames = (userIds = []) => {
    if (!userIds || userIds.length === 0) return 'Unassigned';
    return userIds
      .map(userId => {
        const user = group.members.find(m => m.id === userId);
        return user ? user.name : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Container className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item 
          linkAs={Link} 
          linkProps={{ to: `/group/${groupId}` }}
        >
          {group?.name || 'Loading...'}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {receipt?.name || 'Loading...'}
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="mb-2">{receipt.name}</h2>
          <div className="text-muted mb-2">
            Created: {formatDate(receipt.createdAt)}
          </div>
          <div style={{ width: '200px' }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted">Payment Progress</small>
              <small className="text-success">
                {calculateReceiptPaidPercentage(receipt).toFixed(1)}%
              </small>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ 
                  width: `${calculateReceiptPaidPercentage(receipt)}%`,
                  transition: 'width 1s ease-in-out'
                }} 
                aria-valuenow={calculateReceiptPaidPercentage(receipt)} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="success"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
          <Button 
            variant="primary"
            onClick={() => setIsTaxModalOpen(true)}
            title="Receipt Settings"
          >
            <i className="bi bi-gear-fill"></i>
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="items" title="Items">
          <div className="pt-3">
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {!receipt.items || receipt.items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No items yet
                    </td>
                  </tr>
                ) : (
                  receipt.items.map((item, index) => {
                    // Get consumed by IDs
                    const consumedByIds = item.userIds || [];
                    
                    // Get paid by IDs, excluding the receipt owner
                    const paidByIds = item.paidByIds || [];
                    
                    // Filter out receipt owner from both arrays for comparison
                    const consumersExcludingOwner = consumedByIds.filter(id => id !== receipt.paidTo);
                    const payersExcludingOwner = paidByIds.filter(id => id !== receipt.paidTo);
                    
                    // Check if arrays match after excluding owner
                    const isPaid = consumersExcludingOwner.length > 0 && 
                                   payersExcludingOwner.length > 0 && 
                                   consumersExcludingOwner.length === payersExcludingOwner.length && 
                                   consumersExcludingOwner.every(id => payersExcludingOwner.includes(id));

                    return (
                      <tr 
                        key={index}
                        onClick={(e) => handleItemClick(item, index, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {item.name}
                            {isPaid && (
                              <Badge bg="success" className="ms-2">
                                PAID
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                          <Badge bg="info">RM {item.price.toFixed(2)}</Badge>
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">
                          RM {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>

            {receipt.items && receipt.items.length > 0 && (
              <div className="mb-4">
                <div className="d-flex flex-column gap-2">
                  {/* Subtotal Row */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Subtotal</span>
                    <span>RM {calculateSubtotal(receipt.items).toFixed(2)}</span>
                  </div>

                  {/* SST Row - only show if exists */}
                  {receipt.sst && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">SST ({receipt.sst}%)</span>
                      <span>
                        RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).sst.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Service Charge Row - only show if exists */}
                  {receipt.serviceCharge && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Service Charge ({receipt.serviceCharge}%)</span>
                      <span>
                        RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).serviceCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className="my-2" />

                  {/* Total Row */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-primary fs-5">
                      RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="summary" title="Summary">
          <div className="pt-3">
            <UserSummary 
              users={group.members || []}
              items={receipt.items}
              receipt={receipt}
            />
          </div>
        </Tab>
      </Tabs>

      <AddItemModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
        users={group.members || []}
      />

      <ChangeUserModal
        isOpen={isChangeUserModalOpen}
        onClose={() => {
          setIsChangeUserModalOpen(false);
          setSelectedItemId(null);
          setSelectedUserIds([]);
        }}
        onSubmit={handleChangeUser}
        users={group.members || []}
        itemId={selectedItemId}
        currentUserIds={selectedUserIds}
      />

      <ReceiptSettingsModal
        show={isTaxModalOpen}
        onHide={() => setIsTaxModalOpen(false)}
        onSubmit={handleSettingsUpdate}
        onDelete={handleDeleteReceipt}
        initialData={{
          name: receipt.name,
          paidTo: receipt.paidTo,
          sst: receipt.sst || '',
          serviceCharge: receipt.serviceCharge || ''
        }}
        users={group.members || []}
      />

      <EditItemModal
        show={isEditModalOpen}
        onHide={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditItem}
        initialData={selectedItem}
        users={group.members || []}
      />
    </Container>
  );
};

const EditItemModal = ({ show, onHide, onSubmit, initialData, users }) => {
  const [item, setItem] = useState({
    name: '',
    price: '',
    quantity: '',
    userIds: [],
    paidByIds: [],
    updatedBy: ''
  });

  useEffect(() => {
    if (initialData) {
      setItem({
        name: initialData.name,
        price: initialData.price,
        quantity: initialData.quantity,
        userIds: initialData.userIds || [],
        paidByIds: initialData.paidByIds || [],
        timestamp: initialData.timestamp || initialData.createdAt,
        updatedBy: initialData.updatedBy
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const handleUsersChange = (userIds) => {
    setItem(prev => ({ ...prev, userIds }));
  };

  const handlePaidByChange = (paidByIds) => {
    setItem(prev => ({ ...prev, paidByIds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...item,
    });
  };

  const handleCopy = () => {
    onSubmit({
      ...item,
      isCopy: true
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onSubmit({
        ...item,
        isDelete: true,  // Add flag to indicate this is a deletion
        index: initialData.index
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {initialData?.timestamp && (
          <div className="text-muted mb-3">
            Last Updated: {formatDate(initialData.timestamp)}
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={item.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <UserSelect
              label="Consumed By (Optional)"
              value={item.userIds}
              onChange={handleUsersChange}
              options={users}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <UserSelect
              label="Paid By (Optional)"
              value={item.paidByIds}
              onChange={handlePaidByChange}
              options={users}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-danger" 
              onClick={handleDelete}
              type="button"
              title="Delete"
            >
              <i className="bi bi-trash"></i>
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={handleCopy}
              type="button"
              title="Copy"
            >
              <i className="bi bi-files"></i>
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              title="Save"
            >
              <i className="bi bi-check-lg"></i>
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReceiptPage; 