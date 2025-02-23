import { db } from './firebase'; // 导入 Firebase 初始化文件
import { doc, setDoc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * 创建群组
 * @param {string} groupName - 群组名称
 * @returns {string} - 群组ID
 */
export const createGroup = async (groupName) => {
  const groupId = uuidv4(); // 生成唯一群组ID
  await setDoc(doc(db, 'groups', groupId), {
    id: groupId,
    name: groupName,
    createdAt: new Date().toISOString(),
    members: [],
    receipts: [], // Add receipts array to store receipt references
    receiptNames: [], // Add this line
  });
  return groupId; // 返回群组ID
};

/**
 * 创建收据
 * @param {string} groupId - 群组ID
 * @param {Object} receiptData - 收据数据
 * @param {string} receiptData.name - 收据名称
 * @param {number} receiptData.price - 价格
 * @param {number} receiptData.quantity - 数量
 * @returns {string} - 收据ID
 */
export const createReceipt = async (groupId, receiptData) => {
  const receiptId = uuidv4();
  await setDoc(doc(db, 'receipts', receiptId), {
    id: receiptId,
    groupId: groupId,
    name: receiptData.name,
    items: [],
    createdAt: new Date().toISOString(),
  });

  await updateDoc(doc(db, 'groups', groupId), {
    receipts: arrayUnion(receiptId)
  });

  return receiptId;
};

/**
 * 加入群组
 * @param {string} groupId - 群组ID
 * @param {string} memberName - 成员名字
 */
export const joinGroup = async (groupId, memberName) => {
  await updateDoc(doc(db, 'groups', groupId), {
    members: arrayUnion({ name: memberName }),
  });
};

/**
 * 添加朋友到收据
 * @param {string} receiptId - 收据ID
 * @param {string} friendName - 朋友名字
 * @param {string[]} selectedItems - 选择的食物列表
 */
export const addFriendToReceipt = async (receiptId, friendName, selectedItems) => {
  await updateDoc(doc(db, 'receipts', receiptId), {
    friends: arrayUnion({ name: friendName, selectedItems }),
  });
};

/**
 * 获取群组数据
 * @param {string} groupId - 群组ID
 * @returns {Promise<Object>} - 群组数据
 */
export const getGroup = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  return groupDoc.data();
};

/**
 * 获取收据数据
 * @param {string} receiptId - 收据ID
 * @returns {Promise<Object>} - 收据数据
 */
export const getReceipt = async (receiptId) => {
  const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
  return receiptDoc.data();
};

/**
 * 获取群组的所有收据
 * @param {string} groupId - 群组ID
 * @returns {Promise<Array>} - 收据列表
 */
export const getGroupReceipts = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  const groupData = groupDoc.data();
  
  if (!groupData.receipts) return [];
  
  const receipts = await Promise.all(
    groupData.receipts.map(receiptId => getReceipt(receiptId))
  );
  
  return receipts;
};

/**
 * 创建收据名称
 * @param {string} groupId - 群组ID
 * @param {Object} receiptNameData - 收据名称数据
 * @param {string} receiptNameData.name - 名称
 * @param {number} receiptNameData.price - 默认价格
 * @returns {string} - 收据名称ID
 */
export const createReceiptName = async (groupId, receiptNameData) => {
  const receiptNameId = uuidv4();
  await setDoc(doc(db, 'receiptNames', receiptNameId), {
    id: receiptNameId,
    groupId: groupId,
    name: receiptNameData.name,
    price: receiptNameData.price,
    createdAt: new Date().toISOString(),
  });

  // Add reference to group
  await updateDoc(doc(db, 'groups', groupId), {
    receiptNames: arrayUnion(receiptNameId)
  });

  return receiptNameId;
};

/**
 * 获取群组的所有收据名称
 * @param {string} groupId - 群组ID
 * @returns {Promise<Array>} - 收据名称列表
 */
export const getGroupReceiptNames = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  const groupData = groupDoc.data();
  
  if (!groupData.receiptNames) return [];
  
  const receiptNames = await Promise.all(
    groupData.receiptNames.map(async (receiptNameId) => {
      const receiptNameDoc = await getDoc(doc(db, 'receiptNames', receiptNameId));
      return receiptNameDoc.data();
    })
  );
  
  return receiptNames;
};

/**
 * 更新项目的用户
 * @param {string} receiptId - 收据ID
 * @param {number} itemIndex - 项目索引
 * @param {string[]} userIds - 用户ID数组
 */
export const updateItemUsers = async (receiptId, itemIndex, userIds) => {
  const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
  const receiptData = receiptDoc.data();
  
  const updatedItems = [...receiptData.items];
  const updatedItem = { ...updatedItems[itemIndex] };
  
  if (userIds && userIds.length > 0) {
    // Add or update userIds
    updatedItem.userIds = userIds;
  } else {
    // Remove userIds if empty array
    delete updatedItem.userIds;
  }
  
  updatedItems[itemIndex] = updatedItem;

  await updateDoc(doc(db, 'receipts', receiptId), {
    items: updatedItems
  });
};

/**
 * 添加项目到收据
 * @param {string} receiptId - 收据ID
 * @param {Object} itemData - 项目数据
 * @param {string} itemData.name - 项目名称
 * @param {number} itemData.price - 项目价格
 * @param {number} itemData.quantity - 项目数量
 * @param {string[]} itemData.userIds - 项目关联的用户ID数组
 */
export const addItemToReceipt = async (receiptId, itemData) => {
  const { name, price, quantity, userIds } = itemData;
  const itemToAdd = {
    name,
    price,
    quantity,
    totalAmount: price * quantity,
    createdAt: new Date().toISOString(),
  };

  // Only add userIds if there are any selected
  if (userIds && userIds.length > 0) {
    itemToAdd.userIds = userIds;
  }

  await updateDoc(doc(db, 'receipts', receiptId), {
    items: arrayUnion(itemToAdd)
  });
};

/**
 * 添加成员到群组
 * @param {string} groupId - 群组ID
 * @param {Object} userData - 用户数据
 * @returns {string} - 用户ID
 */
export const addMemberToGroup = async (groupId, userData) => {
  const memberId = uuidv4();
  const memberData = {
    id: memberId,
    name: userData.name,
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, 'groups', groupId), {
    members: arrayUnion(memberData)
  });

  return memberId;
};

/**
 * 更新成员信息
 * @param {string} groupId - 群组ID
 * @param {string} memberId - 成员ID
 * @param {Object} userData - 新的用户数据
 */
export const updateMember = async (groupId, memberId, userData) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  const groupData = groupDoc.data();
  
  const updatedMembers = groupData.members.map(member => 
    member.id === memberId ? { ...member, ...userData } : member
  );

  await updateDoc(doc(db, 'groups', groupId), {
    members: updatedMembers
  });
};

/**
 * 删除成员
 * @param {string} groupId - 群组ID
 * @param {string} memberId - 成员ID
 */
export const deleteMember = async (groupId, memberId) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  const groupData = groupDoc.data();
  
  const updatedMembers = groupData.members.filter(member => member.id !== memberId);

  await updateDoc(doc(db, 'groups', groupId), {
    members: updatedMembers
  });
};

/**
 * 删除收据中的项目
 * @param {string} receiptId - 收据ID
 * @param {number} itemIndex - 项目索引
 */
export const deleteReceiptItem = async (receiptId, itemIndex) => {
  const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
  const receiptData = receiptDoc.data();
  
  const updatedItems = [...receiptData.items];
  updatedItems.splice(itemIndex, 1);

  await updateDoc(doc(db, 'receipts', receiptId), {
    items: updatedItems
  });
};

/**
 * 删除收据
 * @param {string} groupId - 群组ID
 * @param {string} receiptId - 收据ID
 */
export const deleteReceipt = async (groupId, receiptId) => {
  // Remove receipt from group
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  const groupData = groupDoc.data();
  
  const updatedReceipts = groupData.receipts.filter(id => id !== receiptId);
  
  await updateDoc(doc(db, 'groups', groupId), {
    receipts: updatedReceipts
  });

  // Delete the receipt document
  await deleteDoc(doc(db, 'receipts', receiptId));
};

/**
 * 更新收据税费设置
 * @param {string} receiptId - 收据ID
 * @param {Object} taxData - 税费数据
 * @param {number} taxData.sst - SST 百分比
 * @param {number} taxData.serviceCharge - 服务费百分比
 */
export const updateReceiptTaxes = async (receiptId, taxData) => {
  await updateDoc(doc(db, 'receipts', receiptId), {
    sst: taxData.sst,
    serviceCharge: taxData.serviceCharge
  });
};

/**
 * 更新收据项目
 * @param {string} receiptId - 收据ID
 * @param {number} itemIndex - 项目索引
 * @param {Object} itemData - 更新的项目数据
 */
export const updateReceiptItem = async (receiptId, itemIndex, itemData) => {
  const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
  const receiptData = receiptDoc.data();
  
  const updatedItems = [...receiptData.items];
  updatedItems[itemIndex] = {
    ...updatedItems[itemIndex],
    ...itemData,
    totalAmount: itemData.price * itemData.quantity,
    updatedAt: new Date().toISOString()
  };

  await updateDoc(doc(db, 'receipts', receiptId), {
    items: updatedItems
  });
};