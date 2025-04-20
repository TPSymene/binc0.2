import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './Dashboard.css';


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


const TopProducts = ({ products }) => (
  <div className="dashboard-card top-products">
    <div className="dashboard-card-header">
      <h2 className="dashboard-card-title">المنتجات الأكثر شعبية</h2>
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
                <span className="product-sales">{product.views} مشاهدة</span>
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

function Dashboard({ shopData }) {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalReviews: 0,
    totalProducts: 0,
    totalCustomers: 0,
    viewsChange: 0,
    reviewsChange: 0,
    productsChange: 0,
    customersChange: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // جلب الإحصائيات
        const statsData = await dashboardService.getStats();
        setStats({
          ...stats,
          ...statsData,
          // إضافة قيم افتراضية إذا لم تكن موجودة
          totalViews: statsData.totalViews || 0,
          totalReviews: statsData.totalReviews || 0,
          viewsChange: statsData.viewsChange || 0,
          reviewsChange: statsData.reviewsChange || 0
        });

        // جلب المنتجات الأكثر شعبية
        const productsData = await dashboardService.products.getTopProducts();
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
        <p>هنا يمكنك إدارة متجرك ومتابعة أداء منتجاتك والتفاعل مع المستخدمين</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="إجمالي المشاهدات"
          value={stats.totalViews || 0}
          icon="fa-eye"
          color="#28a745"
          change={stats.viewsChange || 0}
          period="هذا الشهر"
        />
        <StatCard
          title="إجمالي التقييمات"
          value={stats.totalReviews || 0}
          icon="fa-star"
          color="#007bff"
          change={stats.reviewsChange || 0}
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



      <div className="dashboard-row two-columns">
        <TopProducts products={topProducts} />
        <RecentReviews reviews={recentReviews} />
      </div>
    </div>
  );
}

export default Dashboard;
