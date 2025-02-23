import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  getReceipt, 
  addItemToReceipt, 
  getGroup, 
  updateItemUsers, 
  deleteReceiptItem,
  updateReceiptTaxes,
  updateReceiptItem
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
  Breadcrumb
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
  const [isOpen, setIsOpen] = useState(false);

  const calculateUserTotal = (userId) => {
    let total = 0;
    items.forEach(item => {
      if (item.userIds && item.userIds.includes(userId)) {
        const perPersonCost = (item.price * item.quantity) / item.userIds.length;
        total += perPersonCost;
      }
    });

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

  return (
    <div style={styles.accordion}>
      <div 
        style={styles.accordionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>User Details</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div style={styles.accordionContent}>
          {users.map(user => {
            const userItems = getUserItems(user.id);
            const total = calculateUserTotal(user.id);
            
            if (userItems.length === 0) return null;

            return (
              <div key={user.id} style={styles.userSummaryCard}>
                <div style={styles.userSummaryHeader}>
                  <span style={styles.userName}>{user.name}</span>
                  <span style={styles.userTotal}>RM {total.toFixed(2)}</span>
                </div>
                <div style={styles.userItemList}>
                  {userItems.map((item, index) => (
                    <div key={index} style={styles.userItem}>
                      <div style={styles.userItemDetails}>
                        <span>{item.name}</span>
                        <span style={styles.userItemShare}>
                          {item.userIds.length > 1 ? `(Split ${item.userIds.length} ways)` : ''}
                        </span>
                      </div>
                      <span>RM {item.perPersonCost.toFixed(2)}</span>
                    </div>
                  ))}
                  {(receipt.sst || receipt.serviceCharge) && total > 0 && (
                    <div style={styles.taxDetails}>
                      {receipt.sst && (
                        <div style={styles.taxItem}>
                          <span>SST ({receipt.sst}%)</span>
                          <span>RM {(total * receipt.sst / 100).toFixed(2)}</span>
                        </div>
                      )}
                      {receipt.serviceCharge && (
                        <div style={styles.taxItem}>
                          <span>Service Charge ({receipt.serviceCharge}%)</span>
                          <span>RM {(total * receipt.serviceCharge / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TaxSettingsModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [taxes, setTaxes] = useState({
    sst: '',
    serviceCharge: ''
  });

  useEffect(() => {
    setTaxes(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      sst: taxes.sst ? Number(taxes.sst) : null,
      serviceCharge: taxes.serviceCharge ? Number(taxes.serviceCharge) : null
    };
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>Tax Settings</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>SST (%):</label>
            <input
              style={styles.input}
              type="number"
              value={taxes.sst}
              onChange={(e) => setTaxes(prev => ({ ...prev, sst: e.target.value }))}
              placeholder="Enter SST percentage"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div style={styles.formGroup}>
            <label>Service Charge (%):</label>
            <input
              style={styles.input}
              type="number"
              value={taxes.serviceCharge}
              onChange={(e) => setTaxes(prev => ({ ...prev, serviceCharge: e.target.value }))}
              placeholder="Enter service charge percentage"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: '#999'}}>
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
    
    setSelectedItem({ 
      ...item, 
      index,
      timestamp: item.updatedAt || item.createdAt // Use updatedAt if available, fall back to createdAt
    });
    setIsEditModalOpen(true);
  };

  const handleEditItem = async (itemData) => {
    try {
      await updateReceiptItem(receiptId, selectedItem.index, itemData);
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  if (!receipt || !group) {
    return <div>Loading data...</div>;
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
          <div className="text-muted">
            Created: {formatDate(receipt.createdAt)}
          </div>
        </div>
        <Button 
          variant="primary"
          onClick={() => setIsTaxModalOpen(true)}
        >
          <i className="bi bi-gear-fill me-2"></i>
          Tax Settings
        </Button>
      </div>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Users</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!receipt.items || receipt.items.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted">
                No items yet
              </td>
            </tr>
          ) : (
            receipt.items.map((item, index) => (
              <tr 
                key={index}
                onClick={(e) => handleItemClick(item, index, e)}
                style={{ cursor: 'pointer' }}
              >
                <td>{item.name}</td>
                <td>RM {item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>
                  <Badge bg="info">
                    RM {(item.price * item.quantity).toFixed(2)}
                  </Badge>
                </td>
                <td>{getUserNames(item.userIds)}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(index);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {receipt.items && receipt.items.length > 0 && (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row className="text-end">
                <Col>
                  <div className="d-flex justify-content-end gap-5">
                    <div>
                      <div className="text-muted mb-1">Subtotal</div>
                      <h4>RM {calculateSubtotal(receipt.items).toFixed(2)}</h4>
                    </div>
                    {receipt.sst && (
                      <div>
                        <div className="text-muted mb-1">SST ({receipt.sst}%)</div>
                        <h4>RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).sst.toFixed(2)}</h4>
                      </div>
                    )}
                    {receipt.serviceCharge && (
                      <div>
                        <div className="text-muted mb-1">Service Charge ({receipt.serviceCharge}%)</div>
                        <h4>RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).serviceCharge.toFixed(2)}</h4>
                      </div>
                    )}
                    <div>
                      <div className="text-muted mb-1">Total</div>
                      <h4 className="text-primary">
                        RM {calculateTaxes(calculateSubtotal(receipt.items), receipt).total.toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">User Summary</h3>
              </div>
              <UserSummary 
                users={group.members || []}
                items={receipt.items}
                receipt={receipt}
              />
            </Card.Body>
          </Card>
        </>
      )}

      <Button
        className="position-fixed bottom-0 end-0 m-4"
        style={{ width: '60px', height: '60px', borderRadius: '30px' }}
        variant="success"
        onClick={() => setIsModalOpen(true)}
      >
        <i className="bi bi-plus-lg fs-4"></i>
      </Button>

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

      <TaxSettingsModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        onSubmit={handleTaxUpdate}
        initialData={{
          sst: receipt.sst || '',
          serviceCharge: receipt.serviceCharge || ''
        }}
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
    userIds: []
  });

  useEffect(() => {
    if (initialData) {
      setItem({
        name: initialData.name,
        price: initialData.price,
        quantity: initialData.quantity,
        userIds: initialData.userIds || [],
        timestamp: initialData.timestamp || initialData.createdAt // Use timestamp if available, fall back to createdAt
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item);
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
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReceiptPage; 