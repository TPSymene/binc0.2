import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './Dashboard.css';

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

// مكون لعرض البطاقات الإحصائية
const StatCard = ({ title, value, icon, color, change, period }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ backgroundColor: `${color}20`, color }}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="stat-card-content">
      <h3 className="stat-card-title">{title}</h3>
      <div className="stat-card-value">{value}</div>
      {change !== undefined && (
        <div className={`stat-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
          <i className={`fas fa-arrow-${change >= 0 ? 'up' : 'down'}`}></i>
          <span>{Math.abs(change)}% {change >= 0 ? 'زيادة' : 'انخفاض'}</span>
          <span className="period">{period}</span>
        </div>
      )}
    </div>
  </div>
);

// مكون لعرض آخر الطلبات
const RecentOrders = ({ orders }) => (
  <div className="dashboard-card recent-orders">
    <div className="dashboard-card-header">
      <h2 className="dashboard-card-title">آخر الطلبات</h2>
      <Link to="/owner-dashboard/orders" className="view-all-link">
        عرض الكل <i className="fas fa-arrow-left"></i>
      </Link>
    </div>

    <div className="table-responsive">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>المبلغ</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id.substring(0, 8)}</td>
                <td>{order.customer.name}</td>
                <td>{order.total_amount} ريال</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('ar-SA')}</td>
                <td>
                  <Link to={`/owner-dashboard/orders/${order.id}`} className="action-btn">
                    <i className="fas fa-eye"></i>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">لا توجد طلبات حديثة</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// مكون لعرض المنتجات الأكثر مبيعًا
const TopProducts = ({ products }) => (
  <div className="dashboard-card top-products">
    <div className="dashboard-card-header">
      <h2 className="dashboard-card-title">المنتجات الأكثر مبيعًا</h2>
      <Link to="/owner-dashboard/products" className="view-all-link">
        عرض الكل <i className="fas fa-arrow-left"></i>
      </Link>
    </div>

    <div className="products-list">
      {products.length > 0 ? (
        products.map(product => (
          <div key={product.id} className="product-item">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="no-image">
                  <i className="fas fa-image"></i>
                </div>
              )}
            </div>
            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-meta">
                <span className="product-price">{product.price} ريال</span>
                <span className="product-sales">{product.sales} مبيعات</span>
              </div>
              <div className="product-rating">
                <div className="stars" style={{ '--rating': product.rating }}></div>
                <span className="rating-value">({product.rating})</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-data">لا توجد منتجات</div>
      )}
    </div>
  </div>
);

// مكون لعرض آخر التقييمات
const RecentReviews = ({ reviews }) => (
  <div className="dashboard-card recent-reviews">
    <div className="dashboard-card-header">
      <h2 className="dashboard-card-title">آخر التقييمات</h2>
      <Link to="/owner-dashboard/reviews" className="view-all-link">
        عرض الكل <i className="fas fa-arrow-left"></i>
      </Link>
    </div>

    <div className="reviews-list">
      {reviews.length > 0 ? (
        reviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="reviewer-details">
                  <h3 className="reviewer-name">{review.user.username}</h3>
                  <div className="review-date">{new Date(review.created_at).toLocaleDateString('ar-SA')}</div>
                </div>
              </div>
              <div className="review-rating">
                <div className="stars" style={{ '--rating': review.rating }}></div>
                <span className="rating-value">({review.rating})</span>
              </div>
            </div>
            <div className="review-product">
              <span className="product-label">المنتج:</span>
              <Link to={`/owner-dashboard/products/edit/${review.product.id}`} className="product-link">
                {review.product.name}
              </Link>
            </div>
            <p className="review-content">{review.comment}</p>
          </div>
        ))
      ) : (
        <div className="no-data">لا توجد تقييمات حديثة</div>
      )}
    </div>
  </div>
);

// الصفحة الرئيسية للوحة التحكم
function Dashboard({ shopData }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // جلب الإحصائيات
        const statsData = await dashboardService.analytics.getStats();
        setStats(statsData);

        // جلب آخر الطلبات
        const ordersData = await dashboardService.orders.getRecent();
        setRecentOrders(ordersData);

        // جلب المنتجات الأكثر مبيعًا
        const productsData = await dashboardService.products.getTopSelling();
        setTopProducts(productsData);

        // جلب آخر التقييمات
        const reviewsData = await dashboardService.reviews.getRecent();
        setRecentReviews(reviewsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // تم نقل الدالة إلى مستوى أعلى

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>مرحبًا بك في لوحة التحكم</h1>
        <p>هنا يمكنك إدارة متجرك ومتابعة أداء منتجاتك وطلباتك</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="إجمالي المبيعات"
          value={`${stats.totalSales} ريال`}
          icon="fa-money-bill-wave"
          color="#28a745"
          change={stats.salesChange}
          period="هذا الشهر"
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon="fa-shopping-cart"
          color="#007bff"
          change={stats.ordersChange}
          period="هذا الشهر"
        />
        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          icon="fa-box"
          color="#fd7e14"
          change={stats.productsChange}
          period="هذا الشهر"
        />
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon="fa-users"
          color="#6f42c1"
          change={stats.customersChange}
          period="هذا الشهر"
        />
      </div>

      <div className="dashboard-row">
        <RecentOrders orders={recentOrders} />
      </div>

      <div className="dashboard-row two-columns">
        <TopProducts products={topProducts} />
        <RecentReviews reviews={recentReviews} />
      </div>
    </div>
  );
}

export default Dashboard;
