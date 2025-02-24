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
  deleteReceipt,
  updateAllReceiptItems
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
import CountUp from 'react-countup';
import AttachmentsTab from './components/AttachmentsTab';

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
const UserSelect = ({ value, onChange, options, label, disabled }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      backgroundColor: disabled ? '#f8f9fa' : 'white',
      opacity: disabled ? 0.7 : 1,
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        {label}
        {disabled && (
          <small className="text-muted ms-2">
            (Select consumers first)
          </small>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {options.length > 0 ? options.map(option => (
          <div
            key={option.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: value.includes(option.id) ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
            onClick={() => {
              if (!disabled) {
                const newValue = value.includes(option.id)
                  ? value.filter(id => id !== option.id)
                  : [...value, option.id];
                onChange(newValue);
              }
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
        )) : (
          <div style={{ color: '#666', padding: '8px', gridColumn: '1 / -1' }}>
            {disabled ? 'Select consumers first' : 'No users available'}
          </div>
        )}
      </div>
    </div>
  );
};

const AddItemModal = ({ show, onHide, onSubmit }) => {
  const [item, setItem] = useState({
    name: '',
    price: '',
    quantity: '1'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item);
    setItem({
      name: '',
      price: '',
      quantity: '1'
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              value={item.name}
              onChange={(e) => setItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-8">
              <Form.Label>Price (RM)</Form.Label>
              <Form.Control
                type="number"
                value={item.price}
                onChange={(e) => setItem(prev => ({ ...prev, price: e.target.value }))}
                step="0.01"
                min="0"
                placeholder="Enter price"
                required
              />
            </div>
            <div className="col-4">
              <Form.Label>Qty</Form.Label>
              <Form.Control
                type="number"
                value={item.quantity}
                onChange={(e) => setItem(prev => ({ ...prev, quantity: e.target.value }))}
                min="1"
                placeholder="Qty"
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Add Item
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

const UserSummary = ({ users, items, receipt, receiptId }) => {
  // Add state for items
  const [localItems, setLocalItems] = useState(items);

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const calculateUserSubtotal = (userId) => {
    let subtotal = 0;
    localItems.forEach(item => {
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

    let total = 0;
    localItems.forEach(item => {
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

        total += perPersonTotal;
      }
    });

    return total;
  };

  const getUserItems = (userId) => {
    return localItems.filter(item => 
      item.userIds && item.userIds.includes(userId)
    ).map(item => ({
      ...item,
      perPersonCost: (item.price * item.quantity) / item.userIds.length
    }));
  };

  const calculateUserPayments = (userId) => {
    // If this is the receipt owner (paidTo), they paid the total amount
    if (userId === receipt.paidTo) {
      const totalAmount = localItems.reduce((sum, item) => {
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

    // For non-owners, calculate their paid amount
    let totalPaid = 0;
    localItems.forEach(item => {
      if (item.paidByIds && item.paidByIds.includes(userId)) {
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

        totalPaid += perPersonTotal;
      }
    });

    return totalPaid;
  };

  const handleBulkPaymentUpdate = async (userId, shouldMarkAsPaid, receiptItems = null) => {
    try {
      // If receiptItems is provided, only update those items
      const itemsToUpdate = receiptItems || localItems;
      
      // Create a copy of all items with updates
      const updatedItems = localItems.map(item => {
        // Check if this item should be updated
        if (itemsToUpdate.find(updateItem => updateItem === item) && 
            item.userIds && 
            item.userIds.includes(userId)) {
          let paidByIds = new Set(item.paidByIds || []);
          
          if (shouldMarkAsPaid) {
            paidByIds.add(userId);
          } else {
            paidByIds.delete(userId);
          }
          
          return {
            ...item,
            paidByIds: Array.from(paidByIds)
          };
        }
        return item;
      });

      // Update local state immediately
      setLocalItems(updatedItems);

      // Update Firebase
      await updateAllReceiptItems(receiptId, updatedItems);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
      // Revert local state on error
      setLocalItems(items);
    }
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

        // Calculate if all consumed items are paid
        const isAllPaid = userItems.every(item => 
          item.paidByIds && item.paidByIds.includes(user.id)
        );

        return (
          <div key={user.id} className="mb-4">
            <div className="bg-white rounded shadow-sm">
              <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="checkbox"
                    checked={isAllPaid}
                    onChange={(e) => {
                      // Get all items for this user in this receipt
                      const userItems = getUserItems(user.id);
                      handleBulkPaymentUpdate(user.id, !isAllPaid, userItems);
                    }}
                    label=""
                    className="me-2"
                  />
                  <span className="fw-bold">
                    {user.name}
                    {user.id === receipt.paidTo && (
                      <Badge bg="primary" className="ms-2">Owner</Badge>
                    )}
                  </span>
                </div>
                <div className="text-end">
                  <div className="text-muted small">
                    Paid: RM <CountUp
                      end={paid}
                      decimals={2}
                      duration={0.75}
                    />
                  </div>
                  <div className="text-primary fw-bold">
                    Owed: RM <CountUp
                      end={total}
                      decimals={2}
                      duration={0.75}
                    />
                  </div>
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
                      <span>
                        RM <CountUp
                          end={item.perPersonCost}
                          decimals={2}
                          duration={0.5}
                        />
                      </span>
                    </div>
                  );
                })}

                {/* Always show subtotal and taxes if there are items */}
                {userItems.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Subtotal</span>
                      <span>
                        RM <CountUp
                          end={subtotal}
                          decimals={2}
                          duration={0.75}
                        />
                      </span>
                    </div>
                    {receipt.sst && (
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>SST ({receipt.sst}%)</span>
                        <span>
                          RM <CountUp
                            end={subtotal * receipt.sst / 100}
                            decimals={2}
                            duration={0.75}
                          />
                        </span>
                      </div>
                    )}
                    {receipt.serviceCharge && (
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Service Charge ({receipt.serviceCharge}%)</span>
                        <span>
                          RM <CountUp
                            end={subtotal * receipt.serviceCharge / 100}
                            decimals={2}
                            duration={0.75}
                          />
                        </span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold small mt-2">
                      <span>Total</span>
                      <span>
                        RM <CountUp
                          end={user.id === receipt.paidTo ? subtotal : total}
                          decimals={2}
                          duration={1}
                        />
                      </span>
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

const ReceiptSettingsModal = ({ show, onHide, initialData, users, onDelete, receiptId }) => {
  const [settings, setSettings] = useState({
    name: '',
    paidTo: '',
    sst: '',
    serviceCharge: ''
  });

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

  const handleSettingChange = async (field, value) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);

    try {
      await updateReceiptSettings(receiptId, {
        ...newSettings,
        sst: newSettings.sst ? Number(newSettings.sst) : null,
        serviceCharge: newSettings.serviceCharge ? Number(newSettings.serviceCharge) : null
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Receipt Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Receipt Name</Form.Label>
            <Form.Control
              type="text"
              value={settings.name}
              onChange={(e) => handleSettingChange('name', e.target.value)}
              placeholder="Enter receipt name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Paid To</Form.Label>
            <Form.Select
              value={settings.paidTo}
              onChange={(e) => handleSettingChange('paidTo', e.target.value)}
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>SST (%)</Form.Label>
            <Form.Control
              type="number"
              value={settings.sst}
              onChange={(e) => handleSettingChange('sst', e.target.value)}
              placeholder="Enter SST percentage"
              step="0.1"
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service Charge (%)</Form.Label>
            <Form.Control
              type="number"
              value={settings.serviceCharge}
              onChange={(e) => handleSettingChange('serviceCharge', e.target.value)}
              placeholder="Enter service charge percentage"
              step="0.1"
              min="0"
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-danger" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this receipt?')) {
                  onDelete(receiptId);
                }
              }}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Receipt
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
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
  
  // Calculate total amount excluding owner's items
  let totalAmount = 0;
  let totalPaidAmount = 0;

  // First calculate total amount excluding owner's items
  receipt.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const consumersExcludingOwner = (item.userIds || [])
      .filter(id => id !== receipt.paidTo);
    
    if (consumersExcludingOwner.length > 0) {
      // Add this item's share to total
      totalAmount += itemTotal;
    }
  });

  // Add taxes to total amount
  if (receipt.sst) {
    totalAmount += totalAmount * (receipt.sst / 100);
  }
  if (receipt.serviceCharge) {
    totalAmount += totalAmount * (receipt.serviceCharge / 100);
  }

  // Calculate paid amount
  receipt.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const consumersExcludingOwner = (item.userIds || [])
      .filter(id => id !== receipt.paidTo);
    const payersExcludingOwner = (item.paidByIds || [])
      .filter(id => id !== receipt.paidTo)
      .filter(id => item.userIds.includes(id));

    if (consumersExcludingOwner.length > 0) {
      const perPersonShare = itemTotal / consumersExcludingOwner.length;
      let perPersonShareWithTaxes = perPersonShare;
      
      if (receipt.sst) {
        perPersonShareWithTaxes += perPersonShare * (receipt.sst / 100);
      }
      if (receipt.serviceCharge) {
        perPersonShareWithTaxes += perPersonShare * (receipt.serviceCharge / 100);
      }

      totalPaidAmount += perPersonShareWithTaxes * payersExcludingOwner.length;
    }
  });

  return totalAmount > 0 ? (totalPaidAmount / totalAmount) * 100 : 0;
};

// Update the InsightsTab component definition
const InsightsTab = ({ receipt, users, items, calculateTaxes, calculateSubtotal }) => {
  // Calculate various statistics
  const stats = {
    totalItems: items.length,
    totalAmount: calculateTaxes(calculateSubtotal(items), receipt).total,
    averagePerPerson: calculateTaxes(calculateSubtotal(items), receipt).total / 
      (users.filter(u => u.id !== receipt.paidTo).length || 1),
    mostExpensiveItem: [...items].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))[0],
    mostSharedItem: [...items].sort((a, b) => (b.userIds?.length || 0) - (a.userIds?.length || 0))[0],
  };

  // Calculate per-user statistics
  const userStats = users.map(user => {
    const userItems = items.filter(item => item.userIds?.includes(user.id));
    const totalOwed = userItems.reduce((sum, item) => {
      const perPersonCost = (item.price * item.quantity) / (item.userIds?.length || 1);
      return sum + perPersonCost;
    }, 0);
    const itemsPaid = items.filter(item => item.paidByIds?.includes(user.id)).length;

    return {
      ...user,
      itemsConsumed: userItems.length,
      totalOwed,
      itemsPaid,
    };
  });

  return (
    <div className="pt-3">
      {/* Key Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Amount</h6>
              <h3 className="mb-0">RM {stats.totalAmount.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Items</h6>
              <h3 className="mb-0">{stats.totalItems}</h3>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Average Per Person</h6>
              <h3 className="mb-0">RM {stats.averagePerPerson.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Most Expensive & Most Shared Items */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Most Expensive Item</h6>
              {stats.mostExpensiveItem && (
                <>
                  <h5>{stats.mostExpensiveItem.name}</h5>
                  <div className="text-primary">
                    RM {(stats.mostExpensiveItem.price * stats.mostExpensiveItem.quantity).toFixed(2)}
                  </div>
                  <small className="text-muted">
                    Shared by {stats.mostExpensiveItem.userIds?.length || 0} people
                  </small>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Most Shared Item</h6>
              {stats.mostSharedItem && (
                <>
                  <h5>{stats.mostSharedItem.name}</h5>
                  <div className="text-primary">
                    {stats.mostSharedItem.userIds?.length || 0} people sharing
                  </div>
                  <small className="text-muted">
                    RM {(stats.mostSharedItem.price * stats.mostSharedItem.quantity).toFixed(2)}
                  </small>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* User Statistics Table */}
      <Card>
        <Card.Body>
          <h6 className="mb-3">User Statistics</h6>
          <Table hover responsive>
            <thead>
              <tr>
                <th>User</th>
                <th className="text-end">Items Consumed</th>
                <th className="text-end">Items Paid</th>
                <th className="text-end">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map(user => (
                <tr key={user.id}>
                  <td>
                    {user.name}
                    {user.id === receipt.paidTo && (
                      <Badge bg="info" className="ms-2">Owner</Badge>
                    )}
                  </td>
                  <td className="text-end">{user.itemsConsumed}</td>
                  <td className="text-end">{user.itemsPaid}</td>
                  <td className="text-end">RM {user.totalOwed.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
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
    try {
      await deleteReceiptItem(receiptId, itemIndex);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
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
      if (itemData.isDelete) {
        await handleDeleteItem(itemData.index);
        setIsEditModalOpen(false);  // Close only on delete
        setSelectedItem(null);
        return;
      }

      if (itemData.isCopy) {
        await addItemToReceipt(receiptId, {
          name: itemData.name,
          price: itemData.price,
          quantity: itemData.quantity,
          userIds: itemData.userIds,
          paidByIds: itemData.paidByIds
        });
        setIsEditModalOpen(false);  // Close only on copy
        setSelectedItem(null);
        return;
      }

      // Regular update - don't close modal
      await updateReceiptItem(receiptId, selectedItem.index, {
        name: itemData.name,
        price: Number(itemData.price),
        quantity: Number(itemData.quantity),
        userIds: itemData.userIds,
        paidByIds: itemData.paidByIds
      });

      // Update the selected item state to reflect changes
      setSelectedItem(prev => ({
        ...prev,
        ...itemData
      }));

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
                <CountUp
                  end={calculateReceiptPaidPercentage(receipt)}
                  decimals={1}
                  duration={0.75}
                  suffix="%"
                />
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
                          <Badge bg="info">
                            RM <CountUp 
                              end={item.price} 
                              decimals={2}
                              duration={0.5}
                            />
                          </Badge>
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">
                          RM <CountUp 
                            end={item.price * item.quantity} 
                            decimals={2}
                            duration={0.5}
                          />
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
                    <span>
                      RM <CountUp 
                        end={calculateSubtotal(receipt.items)} 
                        decimals={2}
                        duration={0.75}
                      />
                    </span>
                  </div>

                  {/* SST Row - only show if exists */}
                  {receipt.sst && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">SST ({receipt.sst}%)</span>
                      <span>
                        RM <CountUp 
                          end={calculateTaxes(calculateSubtotal(receipt.items), receipt).sst} 
                          decimals={2}
                          duration={0.75}
                        />
                      </span>
                    </div>
                  )}

                  {/* Service Charge Row - only show if exists */}
                  {receipt.serviceCharge && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Service Charge ({receipt.serviceCharge}%)</span>
                      <span>
                        RM <CountUp 
                          end={calculateTaxes(calculateSubtotal(receipt.items), receipt).serviceCharge} 
                          decimals={2}
                          duration={0.75}
                        />
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className="my-2" />

                  {/* Total Row */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-primary fs-5">
                      RM <CountUp 
                        end={calculateTaxes(calculateSubtotal(receipt.items), receipt).total} 
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="summary" title="Users">
          <div className="pt-3">
            <UserSummary 
              users={group.members} 
              items={receipt.items} 
              receipt={receipt}
              receiptId={receiptId}
            />
          </div>
        </Tab>

        <Tab eventKey="insights" title="Insights">
          <InsightsTab 
            receipt={receipt}
            users={group.members}
            items={receipt.items || []}
            calculateTaxes={calculateTaxes}
            calculateSubtotal={calculateSubtotal}
          />
        </Tab>

        <Tab eventKey="attachments" title="Receipt">
          <AttachmentsTab receiptId={receiptId} />
        </Tab>
      </Tabs>

      <AddItemModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
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
        initialData={{
          name: receipt.name,
          paidTo: receipt.paidTo,
          sst: receipt.sst || '',
          serviceCharge: receipt.serviceCharge || ''
        }}
        users={group.members || []}
        onDelete={handleDeleteReceipt}
        receiptId={receiptId}
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

  // Add function to handle auto-save
  const handleAutoSave = (newItem) => {
    onSubmit({
      ...newItem,
    });
  };

  // Update change handlers to auto-save
  const handleFieldChange = (field, value) => {
    const newItem = { ...item, [field]: value };
    setItem(newItem);
    handleAutoSave(newItem);
  };

  const handleUsersChange = (userIds) => {
    const newItem = { ...item, userIds };
    setItem(newItem);
    handleAutoSave(newItem);
  };

  const handlePaidByChange = (paidByIds) => {
    const newItem = { ...item, paidByIds };
    setItem(newItem);
    handleAutoSave(newItem);
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
        isDelete: true,
        index: initialData.index
      });
    }
  };

  // Get filtered users for Paid By select based on Consumed By selection
  const getPaidByOptions = () => {
    return users.filter(user => item.userIds.includes(user.id));
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
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              value={item.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter item name"
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-8">
              <Form.Label>Price (RM)</Form.Label>
              <Form.Control
                type="number"
                value={item.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                step="0.01"
                min="0"
                placeholder="Enter price"
                required
              />
            </div>
            <div className="col-4">
              <Form.Label>Qty</Form.Label>
              <Form.Control
                type="number"
                value={item.quantity}
                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                min="1"
                placeholder="Qty"
                required
              />
            </div>
          </div>

          <Form.Group className="mb-3">
            <UserSelect
              label="Consumed By"
              value={item.userIds}
              onChange={(userIds) => {
                // When Consumed By changes, filter out any Paid By users that are no longer consumers
                const newPaidByIds = item.paidByIds.filter(id => userIds.includes(id));
                const newItem = { 
                  ...item, 
                  userIds,
                  paidByIds: newPaidByIds
                };
                setItem(newItem);
                handleAutoSave(newItem);
              }}
              options={users}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <UserSelect
              label="Paid By"
              value={item.paidByIds}
              onChange={handlePaidByChange}
              options={getPaidByOptions()}  // Only show users selected in Consumed By
              disabled={item.userIds.length === 0}  // Disable if no consumers selected
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
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReceiptPage; 