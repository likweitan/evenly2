import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from './firebaseUtils';

const Homepage = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    const groupId = await createGroup(groupName);
    navigate(`/group/${groupId}`);
  };

  return (
    <div>
      <h1>欢迎使用收单分享网站</h1>
      <input
        type="text"
        placeholder="输入群组名称"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button onClick={handleCreateGroup}>创建群组</button>
    </div>
  );
};

export default Homepage;