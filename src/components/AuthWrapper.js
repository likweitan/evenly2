import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthWrapper = ({ children, setShowUserModal }) => {
  const location = useLocation();
  const username = Cookies.get('username');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage && !username) {
      setShowUserModal(true);
    }
  }, [location.pathname, username, isHomePage, setShowUserModal]);

  return children;
};

export default AuthWrapper; 