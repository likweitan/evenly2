import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { createReceipt, getGroupReceipts, getGroup, addMemberToGroup, updateMember, deleteMember, deleteReceipt } from './firebaseUtils';

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
        <h2>添加新收据</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>收据名称:</label>
            <input
              style={styles.input}
              type="text"
              value={receiptName}
              onChange={(e) => setReceiptName(e.target.value)}
              placeholder="输入收据名称"
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

const UserModal = ({ isOpen, onClose, onSubmit, initialData = { name: '' }, mode = 'add' }) => {
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

  if (!isOpen) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>{mode === 'add' ? '添加新用户' : '编辑用户'}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>用户名称:</label>
            <input
              style={styles.input}
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="输入用户名称"
              required
            />
          </div>
          <div style={styles.modalButtons}>
            <button 
              type="button" 
              onClick={() => {
                onClose();
                if (mode === 'add') {
                  setUserName('');
                }
              }} 
              style={{...styles.button, backgroundColor: '#999'}}
            >
              取消
            </button>
            <button type="submit" style={styles.button}>
              {mode === 'add' ? '添加' : '保存'}
            </button>
          </div>
        </form>
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
      console.error('添加收据失败:', error);
      alert('添加收据失败');
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
      console.error('添加用户失败:', error);
      alert('添加用户失败');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await updateMember(groupId, selectedUser.id, userData);
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('更新用户失败:', error);
      alert('更新用户失败');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await deleteMember(groupId, userId);
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
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
    
    if (window.confirm('确定要删除这个收据吗？')) {
      try {
        await deleteReceipt(groupId, receiptId);
      } catch (error) {
        console.error('删除收据失败:', error);
        alert('删除收据失败');
      }
    }
  };

  if (!group) {
    return <div>Loading group data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>群组: {group.name || '未命名群组'}</h1>
        <button 
          style={styles.button}
          onClick={() => setIsModalOpen(true)}
        >
          添加收据
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>收据名称</th>
            <th style={styles.th}>总金额</th>
            <th style={styles.th}>创建时间</th>
            <th style={styles.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {receipts.length === 0 ? (
            <tr>
              <td colSpan="4" style={styles.td}>暂无收据</td>
            </tr>
          ) : (
            receipts.map((receipt) => (
              <tr 
                key={receipt.id} 
                onClick={() => handleReceiptClick(receipt.id)}
                style={{ cursor: 'pointer' }}
              >
                <td style={styles.td}>{receipt.name}</td>
                <td style={styles.td}>RM {calculateReceiptTotal(receipt).toFixed(2)}</td>
                <td style={styles.td}>
                  {new Date(receipt.createdAt).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <button
                    onClick={(e) => handleDeleteReceipt(receipt.id, e)}
                    style={styles.deleteButton}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={styles.userSection}>
        <div style={styles.header}>
          <h2>用户管理</h2>
          <button 
            style={styles.button}
            onClick={() => {
              setUserModalMode('add');
              setSelectedUser(null);
              setIsUserModalOpen(true);
            }}
          >
            添加用户
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>用户名称</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {!group.members || group.members.length === 0 ? (
              <tr>
                <td colSpan="2" style={styles.td}>暂无用户</td>
              </tr>
            ) : (
              group.members.map((member) => (
                <tr key={member.id}>
                  <td style={styles.td}>{member.name}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => openEditUserModal(member)}
                      style={{...styles.actionButton, ...styles.editButton}}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteUser(member.id)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReceipt}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={userModalMode === 'add' ? handleAddUser : handleEditUser}
        initialData={selectedUser}
        mode={userModalMode}
      />
    </div>
  );
};

export default GroupPage;
