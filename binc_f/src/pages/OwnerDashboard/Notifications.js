import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './Notifications.css';

function Notifications({ ownerData }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.notifications.getAll();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('حدث خطأ أثناء جلب الإشعارات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // تصفية الإشعارات حسب النوع
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    return notification.notification_type === filter;
  });

  // حساب الإشعارات للصفحة الحالية
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // تعيين الإشعارات كمقروءة
  const markAsRead = async (notificationId) => {
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('حدث خطأ أثناء تعيين الإشعار كمقروء. يرجى المحاولة مرة أخرى.');
    }
  };

  // تعيين جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await dashboardService.notifications.markAllAsRead();

      // تحديث حالة الإشعارات
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('حدث خطأ أثناء تعيين جميع الإشعارات كمقروءة. يرجى المحاولة مرة أخرى.');
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId) => {
    try {
      await dashboardService.notifications.delete(notificationId);

      // إزالة الإشعار من القائمة
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('حدث خطأ أثناء حذف الإشعار. يرجى المحاولة مرة أخرى.');
    }
  };

  // حذف جميع الإشعارات
  const deleteAllNotifications = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟')) {
      try {
        await dashboardService.notifications.deleteAll();

        // إفراغ قائمة الإشعارات
        setNotifications([]);
      } catch (error) {
        console.error('Error deleting all notifications:', error);
        alert('حدث خطأ أثناء حذف جميع الإشعارات. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  // دالة مساعدة لتنسيق التاريخ
  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'منذ لحظات';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('ar-SA', options);
    }
  };

  // دالة مساعدة للحصول على أيقونة نوع الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'fa-shopping-cart';
      case 'promotion':
        return 'fa-tag';
      case 'inventory':
        return 'fa-box';
      case 'general':
      default:
        return 'fa-bell';
    }
  };

  // دالة مساعدة للحصول على لون نوع الإشعار
  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#007bff';
      case 'promotion':
        return '#28a745';
      case 'inventory':
        return '#fd7e14';
      case 'general':
      default:
        return '#6c757d';
    }
  };

  // دالة مساعدة للحصول على نص نوع الإشعار
  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'order':
        return 'طلب';
      case 'promotion':
        return 'عرض';
      case 'inventory':
        return 'مخزون';
      case 'general':
      default:
        return 'عام';
    }
  };

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner"></div>
        <p>جاري تحميل الإشعارات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={fetchNotifications}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>الإشعارات</h1>

        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={markAllAsRead}
            >
              <i className="fas fa-check-double"></i> تعيين الكل كمقروء
            </button>
          )}

          {notifications.length > 0 && (
            <button
              className="delete-all-btn"
              onClick={deleteAllNotifications}
            >
              <i className="fas fa-trash-alt"></i> حذف الكل
            </button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          الكل
          <span className="count">{notifications.length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          غير مقروءة
          <span className="count">{unreadCount}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'order' ? 'active' : ''}`}
          onClick={() => setFilter('order')}
        >
          الطلبات
          <span className="count">{notifications.filter(n => n.notification_type === 'order').length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'promotion' ? 'active' : ''}`}
          onClick={() => setFilter('promotion')}
        >
          العروض
          <span className="count">{notifications.filter(n => n.notification_type === 'promotion').length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'inventory' ? 'active' : ''}`}
          onClick={() => setFilter('inventory')}
        >
          المخزون
          <span className="count">{notifications.filter(n => n.notification_type === 'inventory').length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
          onClick={() => setFilter('general')}
        >
          عام
          <span className="count">{notifications.filter(n => n.notification_type === 'general').length}</span>
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <div className="no-data-icon">
            <i className="fas fa-bell-slash"></i>
          </div>
          <h2>لا توجد إشعارات</h2>
          <p>ليس لديك أي إشعارات {filter !== 'all' ? 'من هذا النوع' : ''} حاليًا.</p>
          {filter !== 'all' && (
            <button
              className="show-all-btn"
              onClick={() => setFilter('all')}
            >
              عرض جميع الإشعارات
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {currentNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div
                  className="notification-icon"
                  style={{ backgroundColor: `${getNotificationColor(notification.notification_type)}20`, color: getNotificationColor(notification.notification_type) }}
                >
                  <i className={`fas ${getNotificationIcon(notification.notification_type)}`}></i>
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-type">
                      {getNotificationTypeText(notification.notification_type)}
                    </div>
                    <div className="notification-time">
                      {formatDate(notification.created_at)}
                    </div>
                  </div>

                  <div className="notification-message">
                    {notification.content}
                  </div>

                  {notification.related_id && (
                    <div className="notification-actions">
                      {notification.notification_type === 'order' && (
                        <Link
                          to={`/owner-dashboard/orders/${notification.related_id}`}
                          className="view-link"
                        >
                          عرض الطلب
                        </Link>
                      )}
                      {notification.notification_type === 'inventory' && (
                        <Link
                          to={`/owner-dashboard/products/edit/${notification.related_id}`}
                          className="view-link"
                        >
                          عرض المنتج
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.is_read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="تعيين كمقروء"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                    title="حذف"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Notifications;
