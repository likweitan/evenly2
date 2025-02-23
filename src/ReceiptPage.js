import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
            暂无可选用户
          </div>
        )}
      </div>
    </div>
  );
};

const AddItemModal = ({ isOpen, onClose, onSubmit, users }) => {
  const [item, setItem] = useState({
    name: '',
    price: '',
    quantity: '',
    userIds: [] // Changed from userId to userIds array
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
    const submitData = {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      ...(item.userIds.length > 0 && { userIds: item.userIds })
    };
    onSubmit(submitData);
    setItem({ name: '', price: '', quantity: '', userIds: [] });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>添加新项目</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>名称:</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>价格:</label>
            <input
              style={styles.input}
              type="number"
              name="price"
              value={item.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>数量:</label>
            <input
              style={styles.input}
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <UserSelect
              label="选择用户 (可选)"
              value={item.userIds}
              onChange={handleUsersChange}
              options={users}
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
        <h2>更改用户</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <UserSelect
              label="选择用户 (可选)"
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
              取消
            </button>
            <button type="submit" style={styles.button}>
              保存
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
        <span style={styles.summaryLabel}>小计</span>
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
          <span style={styles.summaryLabel}>服务费 ({receipt.serviceCharge}%)</span>
          <span style={styles.summaryAmount}>
            RM {taxes.serviceCharge.toFixed(2)}
          </span>
        </div>
      )}
      <div style={styles.summaryValue}>
        <span style={styles.summaryLabel}>总计</span>
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
        <span>用户消费明细</span>
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
                          {item.userIds.length > 1 ? `(${item.userIds.length} 人分)` : ''}
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
                          <span>服务费 ({receipt.serviceCharge}%)</span>
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
        <h2>设置税费</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>SST (%):</label>
            <input
              style={styles.input}
              type="number"
              value={taxes.sst}
              onChange={(e) => setTaxes(prev => ({ ...prev, sst: e.target.value }))}
              placeholder="输入 SST 百分比"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div style={styles.formGroup}>
            <label>服务费 (%):</label>
            <input
              style={styles.input}
              type="number"
              value={taxes.serviceCharge}
              onChange={(e) => setTaxes(prev => ({ ...prev, serviceCharge: e.target.value }))}
              placeholder="输入服务费百分比"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: '#999'}}>
              取消
            </button>
            <button type="submit" style={styles.button}>
              保存
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
      console.error('添加项目失败:', error);
      alert('添加项目失败');
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
      console.error('更改用户失败:', error);
      alert('更改用户失败');
    }
  };

  const openChangeUserModal = (itemIndex, userIds) => {
    setSelectedItemId(itemIndex);
    setSelectedUserIds(userIds || []);
    setIsChangeUserModalOpen(true);
  };

  const handleDeleteItem = async (itemIndex) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      try {
        await deleteReceiptItem(receiptId, itemIndex);
      } catch (error) {
        console.error('删除项目失败:', error);
        alert('删除项目失败');
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
      console.error('更新税费失败:', error);
      alert('更新税费失败');
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
      console.error('更新项目失败:', error);
      alert('更新项目失败');
    }
  };

  if (!receipt || !group) {
    return <div>Loading data...</div>;
  }

  const getUserNames = (userIds = []) => {
    if (!userIds || userIds.length === 0) return '未分配';
    return userIds
      .map(userId => {
        const user = group.members.find(m => m.id === userId);
        return user ? user.name : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>收据: {receipt.name}</h1>
          <div style={styles.dateText}>创建时间: {formatDate(receipt.createdAt)}</div>
        </div>
        <button
          style={{...styles.button, backgroundColor: '#2196F3'}}
          onClick={() => setIsTaxModalOpen(true)}
        >
          税费设置
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>名称</th>
              <th style={styles.th}>单价</th>
              <th style={styles.th}>数量</th>
              <th style={styles.th}>小计</th>
              <th style={styles.th}>用户</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {!receipt.items || receipt.items.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.td}>暂无项目</td>
              </tr>
            ) : (
              receipt.items.map((item, index) => (
                <tr 
                  key={index}
                  onClick={(e) => handleItemClick(item, index, e)}
                  style={{ 
                    cursor: 'pointer',
                    ':hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>RM {item.price.toFixed(2)}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>RM {(item.price * item.quantity).toFixed(2)}</td>
                  <td style={styles.td}>{getUserNames(item.userIds)}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        style={{...styles.actionButton, backgroundColor: '#f44336'}}
                        title="删除"
                      >
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {receipt.items && receipt.items.length > 0 && (
        <>
          <ReceiptSummary
            receipt={receipt}
            items={receipt.items}
            calculateSubtotal={calculateSubtotal}
            calculateTaxes={calculateTaxes}
          />
          <UserSummary 
            users={group.members || []}
            items={receipt.items}
            receipt={receipt}
          />
        </>
      )}

      <button
        style={styles.floatingButton}
        onClick={() => setIsModalOpen(true)}
        title="添加项目"
      >
        +
      </button>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditItem}
        initialData={selectedItem}
        users={group.members || []}
      />
    </div>
  );
};

const EditItemModal = ({ isOpen, onClose, onSubmit, initialData, users }) => {
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

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>编辑项目</h2>
        {initialData?.timestamp && (
          <div style={styles.modalDate}>
            最后更新: {formatDate(initialData.timestamp)}
          </div>
        )}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>名称:</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>价格:</label>
            <input
              style={styles.input}
              type="number"
              name="price"
              value={item.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>数量:</label>
            <input
              style={styles.input}
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <UserSelect
              label="选择用户 (可选)"
              value={item.userIds}
              onChange={handleUsersChange}
              options={users}
            />
          </div>
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: '#999'}}>
              取消
            </button>
            <button type="submit" style={styles.button}>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptPage; 