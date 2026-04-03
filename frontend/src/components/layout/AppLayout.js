import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { notificationsAPI } from '../../api/client';

export const AppLayout = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = () => {
    notificationsAPI.getAll({ unread: true, limit: 1 })
      .then(res => setUnreadCount(res.data?.unreadCount || 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar unreadCount={unreadCount} />
      <div style={{ flex: 1, marginLeft: '240px', minHeight: '100vh', transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '0' }}>
          <Outlet context={{ refreshNotifs: fetchUnread }} />
        </main>
      </div>
    </div>
  );
};
