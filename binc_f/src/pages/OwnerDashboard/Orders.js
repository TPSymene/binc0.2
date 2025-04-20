import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './Orders.css';

function Orders({ shopData }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  // const navigate = useNavigate(); // No se utiliza en este componente

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.orders.getAll();
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('حدث خطأ أثناء جلب الطلبات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // تصفية الطلبات بناءً على البحث والفلاتر
  useEffect(() => {
    let result = [...orders];

    // تصفية حسب البحث
    if (searchTerm) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    // تصفية حسب التاريخ
    if (dateFilter) {
      const today = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          result = result.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === today.toDateString();
          });
          break;
        case 'yesterday':
          filterDate.setDate(today.getDate() - 1);
          result = result.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === filterDate.toDateString();
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          result = result.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= filterDate;
          });
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          result = result.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }

    // ترتيب الطلبات
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'total':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'status':
          comparison = getStatusPriority(a.status) - getStatusPriority(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(result);
    setCurrentPage(1); // إعادة تعيين الصفحة الحالية عند تغيير التصفية
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // حساب الطلبات للصفحة الحالية
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // تحديث حالة الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await dashboardService.orders.updateStatus(orderId, newStatus);

      // تحديث حالة الطلب في القائمة
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  // دالة مساعدة لتحويل حالة الطلب إلى نص (غير مستخدمة حاليًا)
  // const getOrderStatusText = (status) => {
  //   const statusMap = {
  //     'pending': 'قيد الانتظار',
  //     'processing': 'قيد المعالجة',
  //     'shipped': 'تم الشحن',
  //     'delivered': 'تم التوصيل',
  //     'completed': 'مكتمل',
  //     'cancelled': 'ملغي'
  //   };
  //   return statusMap[status] || status;
  // };

  // دالة مساعدة لتحديد أولوية الحالة للترتيب
  const getStatusPriority = (status) => {
    const priorityMap = {
      'pending': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'completed': 5,
      'cancelled': 6
    };
    return priorityMap[status] || 0;
  };

  // حساب إحصائيات الطلبات
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      completed: orders.filter(order => order.status === 'completed').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)
    };
    return stats;
  };

  const orderStats = getOrderStats();

  if (loading && orders.length === 0) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>جاري تحميل الطلبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={fetchOrders}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>إدارة الطلبات</h1>
      </div>

      <div className="orders-stats">
        <div className="stat-item">
          <span className="stat-value">{orderStats.total}</span>
          <span className="stat-label">إجمالي الطلبات</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{orderStats.pending}</span>
          <span className="stat-label">قيد الانتظار</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{orderStats.processing}</span>
          <span className="stat-label">قيد المعالجة</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{orderStats.shipped}</span>
          <span className="stat-label">تم الشحن</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{orderStats.completed}</span>
          <span className="stat-label">مكتملة</span>
        </div>
        <div className="stat-item total-amount">
          <span className="stat-value">{orderStats.totalAmount} ريال</span>
          <span className="stat-label">إجمالي المبيعات</span>
        </div>
      </div>

      <div className="orders-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن طلب أو عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="">جميع التواريخ</option>
            <option value="today">اليوم</option>
            <option value="yesterday">الأمس</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
          </select>
        </div>

        <div className="sort-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">التاريخ</option>
            <option value="total">المبلغ</option>
            <option value="status">الحالة</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-data-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <h2>لا توجد طلبات</h2>
          <p>لم يتم العثور على طلبات تطابق معايير البحث الخاصة بك.</p>
          {searchTerm || statusFilter || dateFilter ? (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
            >
              مسح عوامل التصفية
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.substring(0, 8)}</td>
                    <td>{order.customer.name}</td>
                    <td className="amount-cell">{order.total_amount} ريال</td>
                    <td>{getPaymentMethodText(order.payment_method)}</td>
                    <td>
                      <div className="status-dropdown">
                        <select
                          className={`status-select status-${order.status}`}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">قيد المعالجة</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </div>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className="actions-cell">
                      <Link
                        to={`/owner-dashboard/orders/${order.id}`}
                        className="view-btn"
                        title="عرض التفاصيل"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button
                        className="print-btn"
                        title="طباعة الفاتورة"
                        onClick={() => printInvoice(order.id)}
                      >
                        <i className="fas fa-print"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

// دالة مساعدة لتحويل طريقة الدفع إلى نص
function getPaymentMethodText(method) {
  const methodMap = {
    'credit_card': 'بطاقة ائتمان',
    'paypal': 'باي بال',
    'cash_on_delivery': 'الدفع عند الاستلام'
  };
  return methodMap[method] || method;
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('ar-SA', options);
}

// دالة مساعدة لطباعة الفاتورة
function printInvoice(orderId) {
  // في التطبيق الحقيقي، هذه الدالة ستقوم بفتح نافذة طباعة للفاتورة
  alert(`سيتم طباعة الفاتورة للطلب رقم ${orderId}`);
}

export default Orders;
