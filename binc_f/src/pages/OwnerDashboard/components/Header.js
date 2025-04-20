import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import dashboardService from '../../../services/dashboardService';
import './Header.css';

function Header({ toggleSidebar, ownerData, shopData }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // جلب الإشعارات
    const fetchNotifications = async () => {
      try {
        const response = await dashboardService.notifications.getRecent();
        setNotifications(response);
        
        // حساب عدد الإشعارات غير المقروءة
        const unread = response.filter(notification => !notification.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // إعداد مستمع للنقرات خارج القوائم المنسدلة
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await dashboardService.notifications.markAsRead(notificationId);
      
      // تحديث حالة الإشعارات
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // تحديث عدد الإشعارات غير المقروءة
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-right">
        <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="header-title">لوحة تحكم المالك</h1>
      </div>

      <div className="header-left">
        <div className="header-search">
          <input type="text" placeholder="بحث..." />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="notifications-dropdown" ref={notificationsRef}>
          <button 
            className="notifications-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-menu">
              <div className="notifications-header">
                <h3>الإشعارات</h3>
                <button 
                  className="mark-all-read-btn"
                  onClick={async () => {
                    try {
                      await dashboardService.notifications.markAllAsRead();
                      setNotifications(prevNotifications => 
                        prevNotifications.map(notification => ({ ...notification, is_read: true }))
                      );
                      setUnreadCount(0);
                    } catch (error) {
                      console.error('Error marking all notifications as read:', error);
                    }
                  }}
                >
                  تعيين الكل كمقروء
                </button>
              </div>
              
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-icon">
                        {notification.notification_type === 'order' && <i className="fas fa-shopping-cart"></i>}
                        {notification.notification_type === 'promotion' && <i className="fas fa-tag"></i>}
                        {notification.notification_type === 'inventory' && <i className="fas fa-box"></i>}
                        {notification.notification_type === 'general' && <i className="fas fa-info-circle"></i>}
                      </div>
                      <div className="notification-content">
                        <p>{notification.content}</p>
                        <span className="notification-time">
                          {new Date(notification.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <p>لا توجد إشعارات</p>
                  </div>
                )}
              </div>
              
              <div className="notifications-footer">
                <button 
                  className="view-all-btn"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/owner-dashboard/notifications');
                  }}
                >
                  عرض جميع الإشعارات
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="user-dropdown" ref={userMenuRef}>
          <button 
            className="user-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {ownerData ? ownerData.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="user-name">{ownerData ? ownerData.username : 'المستخدم'}</span>
            <i className="fas fa-chevron-down"></i>
          </button>
          
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-avatar">
                  {ownerData ? ownerData.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{ownerData ? ownerData.username : 'المستخدم'}</h3>
                  <p className="user-email">{ownerData ? ownerData.email : 'user@example.com'}</p>
                </div>
              </div>
              
              <ul className="user-menu-list">
                <li>
                  <button onClick={() => {
                    setShowUserMenu(false);
                    navigate('/owner-dashboard/settings');
                  }}>
                    <i className="fas fa-cog"></i>
                    <span>إعدادات المتجر</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}>
                    <i className="fas fa-user"></i>
                    <span>الملف الشخصي</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>تسجيل الخروج</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
