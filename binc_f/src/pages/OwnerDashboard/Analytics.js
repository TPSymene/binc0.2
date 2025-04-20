import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import './Analytics.css';

function Analytics({ shopData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.analytics.getStats(timeRange);
        setAnalyticsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('حدث خطأ أثناء جلب بيانات التحليلات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>جاري تحميل بيانات التحليلات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={() => setTimeRange(timeRange)}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>تحليلات المتجر</h1>

        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            أسبوع
          </button>
          <button
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            شهر
          </button>
          <button
            className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            سنة
          </button>
        </div>
      </div>

      <div className="analytics-overview">
        <div className="overview-card sales">
          <div className="card-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="card-content">
            <h2>إجمالي المبيعات</h2>
            <div className="card-value">{analyticsData.totalSales} ريال</div>
            <div className={`card-change ${analyticsData.salesChange >= 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${analyticsData.salesChange >= 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(analyticsData.salesChange)}%</span>
              <span className="period">مقارنة بالفترة السابقة</span>
            </div>
          </div>
        </div>

        <div className="overview-card orders">
          <div className="card-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="card-content">
            <h2>عدد الطلبات</h2>
            <div className="card-value">{analyticsData.totalOrders}</div>
            <div className={`card-change ${analyticsData.ordersChange >= 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${analyticsData.ordersChange >= 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(analyticsData.ordersChange)}%</span>
              <span className="period">مقارنة بالفترة السابقة</span>
            </div>
          </div>
        </div>

        <div className="overview-card customers">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="card-content">
            <h2>العملاء الجدد</h2>
            <div className="card-value">{analyticsData.newCustomers}</div>
            <div className={`card-change ${analyticsData.customersChange >= 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${analyticsData.customersChange >= 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(analyticsData.customersChange)}%</span>
              <span className="period">مقارنة بالفترة السابقة</span>
            </div>
          </div>
        </div>

        <div className="overview-card views">
          <div className="card-icon">
            <i className="fas fa-eye"></i>
          </div>
          <div className="card-content">
            <h2>مشاهدات المنتجات</h2>
            <div className="card-value">{analyticsData.productViews}</div>
            <div className={`card-change ${analyticsData.viewsChange >= 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${analyticsData.viewsChange >= 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(analyticsData.viewsChange)}%</span>
              <span className="period">مقارنة بالفترة السابقة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card sales-chart">
          <h2>المبيعات</h2>
          <div className="chart-container">
            <div className="chart-placeholder">
              <div className="chart-bars">
                {analyticsData.salesChart.map((item, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${(item.value / Math.max(...analyticsData.salesChart.map(i => i.value))) * 100}%` }}
                  >
                    <div className="bar-tooltip">{item.value} ريال</div>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {analyticsData.salesChart.map((item, index) => (
                  <div key={index} className="chart-label">{item.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card orders-chart">
          <h2>الطلبات</h2>
          <div className="chart-container">
            <div className="chart-placeholder">
              <div className="chart-bars">
                {analyticsData.ordersChart.map((item, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${(item.value / Math.max(...analyticsData.ordersChart.map(i => i.value))) * 100}%` }}
                  >
                    <div className="bar-tooltip">{item.value} طلب</div>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {analyticsData.ordersChart.map((item, index) => (
                  <div key={index} className="chart-label">{item.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-details">
        <div className="details-card top-products">
          <h2>المنتجات الأكثر مبيعًا</h2>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>المبيعات</th>
                  <th>الإيرادات</th>
                  <th>التقييم</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="product-cell">
                      <div className="product-info">
                        <div className="product-image">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            <div className="no-image">
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                        </div>
                        <div className="product-name">{product.name}</div>
                      </div>
                    </td>
                    <td>{product.sales} مبيعات</td>
                    <td className="revenue">{product.revenue} ريال</td>
                    <td>
                      <div className="product-rating">
                        <div className="stars" style={{ '--rating': product.rating }}></div>
                        <span className="rating-value">({product.rating})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="details-card top-categories">
          <h2>الفئات الأكثر مبيعًا</h2>
          <div className="categories-chart">
            {analyticsData.topCategories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-sales">{category.sales} مبيعات</div>
                </div>
                <div className="category-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(category.sales / Math.max(...analyticsData.topCategories.map(c => c.sales))) * 100}%` }}
                  ></div>
                </div>
                <div className="category-percentage">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-row">
        <div className="details-card order-status">
          <h2>حالة الطلبات</h2>
          <div className="status-chart">
            <div className="donut-chart-container">
              <div className="donut-chart">
                {analyticsData.orderStatus.map((status, index) => (
                  <div
                    key={index}
                    className={`donut-segment status-${status.status}`}
                    style={{
                      '--offset': analyticsData.orderStatus.slice(0, index).reduce((sum, s) => sum + s.percentage, 0),
                      '--value': status.percentage
                    }}
                  ></div>
                ))}
                <div className="donut-hole">
                  <div className="donut-total">{analyticsData.totalOrders}</div>
                  <div className="donut-label">طلب</div>
                </div>
              </div>
            </div>
            <div className="status-legend">
              {analyticsData.orderStatus.map((status, index) => (
                <div key={index} className="legend-item">
                  <div className={`legend-color status-${status.status}`}></div>
                  <div className="legend-label">{getOrderStatusText(status.status)}</div>
                  <div className="legend-value">{status.count}</div>
                  <div className="legend-percentage">({status.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="details-card customer-stats">
          <h2>إحصائيات العملاء</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.customerStats.newCustomers}</div>
                <div className="stat-label">عملاء جدد</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-redo"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.customerStats.returningCustomers}</div>
                <div className="stat-label">عملاء عائدون</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.customerStats.averageOrdersPerCustomer}</div>
                <div className="stat-label">متوسط الطلبات لكل عميل</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-money-bill-alt"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{analyticsData.customerStats.averageOrderValue} ريال</div>
                <div className="stat-label">متوسط قيمة الطلب</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لتحويل حالة الطلب إلى نص
function getOrderStatusText(status) {
  const statusMap = {
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التوصيل',
    'completed': 'مكتمل',
    'cancelled': 'ملغي'
  };
  return statusMap[status] || status;
}

export default Analytics;
