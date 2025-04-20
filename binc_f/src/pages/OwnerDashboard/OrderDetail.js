import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './OrderDetail.css';

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.orders.getById(orderId);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('حدث خطأ أثناء جلب تفاصيل الطلب. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // تحديث حالة الطلب
  const updateOrderStatus = async (newStatus) => {
    try {
      setLoading(true);
      await dashboardService.orders.updateStatus(orderId, newStatus);

      // تحديث حالة الطلب في الواجهة
      setOrder({
        ...order,
        status: newStatus
      });

      setLoading(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // دالة مساعدة لتحويل حالة الطلب إلى نص
  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'processing': 'قيد المعالجة',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  // دالة مساعدة لتحويل طريقة الدفع إلى نص
  const getPaymentMethodText = (method) => {
    const methodMap = {
      'credit_card': 'بطاقة ائتمان',
      'paypal': 'باي بال',
      'cash_on_delivery': 'الدفع عند الاستلام'
    };
    return methodMap[method] || method;
  };

  // دالة مساعدة لتنسيق التاريخ
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };

  // طباعة الفاتورة
  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={() => {
            // Forzar una recarga de los detalles del pedido
            setLoading(true);
            setError(null);
            // El useEffect se activará automáticamente
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>الطلب غير موجود</h2>
        <p>لم يتم العثور على الطلب المطلوب.</p>
        <button
          className="back-btn"
          onClick={() => navigate('/owner-dashboard/orders')}
        >
          العودة إلى قائمة الطلبات
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <div className="header-left">
          <h1>تفاصيل الطلب #{order.id.substring(0, 8)}</h1>
          <p className="order-date">تاريخ الطلب: {formatDate(order.created_at)}</p>
        </div>
        <div className="header-right">
          <button
            className="print-btn"
            onClick={printInvoice}
          >
            <i className="fas fa-print"></i> طباعة الفاتورة
          </button>
          <Link
            to="/owner-dashboard/orders"
            className="back-btn"
          >
            <i className="fas fa-arrow-right"></i> العودة إلى الطلبات
          </Link>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-info-section">
          <div className="order-status-card">
            <h2>حالة الطلب</h2>
            <div className="status-content">
              <div className={`status-badge status-${order.status}`}>
                {getOrderStatusText(order.status)}
              </div>
              <div className="status-update">
                <label htmlFor="status-select">تحديث الحالة:</label>
                <select
                  id="status-select"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>
          </div>

          <div className="order-details-card">
            <h2>تفاصيل الطلب</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">رقم الطلب:</span>
                <span className="detail-value">#{order.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">تاريخ الطلب:</span>
                <span className="detail-value">{formatDate(order.created_at)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">آخر تحديث:</span>
                <span className="detail-value">{formatDate(order.updated_at)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">طريقة الدفع:</span>
                <span className="detail-value">{getPaymentMethodText(order.payment_method)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">إجمالي المبلغ:</span>
                <span className="detail-value amount">{order.total_amount} ريال</span>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-info-card">
          <h2>معلومات العميل</h2>
          <div className="customer-details">
            <div className="customer-avatar">
              {order.customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="customer-info">
              <h3>{order.customer.name}</h3>
              <p><i className="fas fa-envelope"></i> {order.customer.email}</p>
              {order.customer.phone && <p><i className="fas fa-phone"></i> {order.customer.phone}</p>}
            </div>
          </div>
          <div className="shipping-address">
            <h3>عنوان الشحن</h3>
            <p>{order.shipping_address}</p>
          </div>
        </div>

        <div className="order-items-card">
          <h2>المنتجات المطلوبة</h2>
          <div className="order-items-table-container">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="product-cell">
                      <div className="product-info">
                        <div className="product-image">
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} />
                          ) : (
                            <div className="no-image">
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                        </div>
                        <div className="product-details">
                          <h3 className="product-name">{item.product.name}</h3>
                          <Link
                            to={`/owner-dashboard/products/edit/${item.product.id}`}
                            className="view-product-link"
                          >
                            عرض المنتج
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>{item.price} ريال</td>
                    <td>{item.quantity}</td>
                    <td className="total-cell">{(item.price * item.quantity).toFixed(2)} ريال</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-left">المجموع الفرعي</td>
                  <td className="total-cell">{order.total_amount} ريال</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-left">الشحن</td>
                  <td className="total-cell">0.00 ريال</td>
                </tr>
                <tr className="grand-total">
                  <td colSpan="3" className="text-left">الإجمالي</td>
                  <td className="total-cell">{order.total_amount} ريال</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="order-actions-card">
          <h2>الإجراءات</h2>
          <div className="actions-buttons">
            <button
              className="action-btn print-invoice-btn"
              onClick={printInvoice}
            >
              <i className="fas fa-print"></i> طباعة الفاتورة
            </button>
            <button
              className="action-btn send-email-btn"
              onClick={() => alert('سيتم إرسال بريد إلكتروني للعميل')}
            >
              <i className="fas fa-envelope"></i> إرسال بريد إلكتروني
            </button>
            {order.status !== 'cancelled' && (
              <button
                className="action-btn cancel-order-btn"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) {
                    updateOrderStatus('cancelled');
                  }
                }}
              >
                <i className="fas fa-times-circle"></i> إلغاء الطلب
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
