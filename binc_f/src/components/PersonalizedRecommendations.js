import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PersonalizedRecommendations.css';
import authService from '../services/authService';
import recommendationService from '../services/recommendationService';

function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState({
    preferred: [],
    liked: [],
    new: [],
    popular: []
  });
  const [activeTab, setActiveTab] = useState('preferred');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkAuth = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      return auth;
    };

    const fetchRecommendations = async () => {
      if (!checkAuth()) {
        // إذا لم يكن المستخدم مسجل الدخول، نعرض فقط المنتجات الشائعة
        try {
          const popularProducts = await recommendationService.getPopularProducts();
          setRecommendations({
            preferred: [],
            liked: [],
            new: [],
            popular: popularProducts
          });
          setActiveTab('popular');
          setLoading(false);
        } catch (err) {
          console.error('Error fetching popular products:', err);
          setError('حدث خطأ أثناء تحميل المنتجات الشائعة');
          setLoading(false);
        }
        return;
      }

      // إذا كان المستخدم مسجل الدخول، نحصل على التوصيات الشخصية المعززة بالذكاء الاصطناعي
      try {
        // استخدام خدمة التوصيات الجديدة
        const recommendationsData = await recommendationService.getRecommendations();
        setRecommendations(recommendationsData);
        setLoading(false);

        // إذا لم تكن هناك توصيات مفضلة، نعرض المنتجات الشائعة
        if (!recommendationsData.preferred || recommendationsData.preferred.length === 0) {
          setActiveTab('popular');
        }
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
        setError('حدث خطأ أثناء تحميل التوصيات');
        setLoading(false);

        // محاولة الحصول على المنتجات الشائعة كخيار احتياطي
        try {
          const popularProducts = await recommendationService.getPopularProducts();
          setRecommendations({
            preferred: [],
            liked: [],
            new: [],
            popular: popularProducts
          });
          setActiveTab('popular');
        } catch (fallbackErr) {
          console.error('Error fetching fallback products:', fallbackErr);
        }
      }
    };

    fetchRecommendations();
  }, []);

  // تحديد العنوان المناسب حسب نوع التوصية
  const getTabTitle = (tabKey) => {
    switch (tabKey) {
      case 'preferred':
        return 'منتجات قد تعجبك';
      case 'liked':
        return 'منتجات مشابهة لما أعجبك';
      case 'new':
        return 'منتجات جديدة';
      case 'popular':
        return 'الأكثر شعبية';
      default:
        return '';
    }
  };

  // تحديد الرسالة المناسبة عند عدم وجود منتجات
  const getEmptyMessage = (tabKey) => {
    switch (tabKey) {
      case 'preferred':
        return 'لم نتمكن من العثور على توصيات مخصصة لك بعد. تصفح المزيد من المنتجات لتحسين التوصيات.';
      case 'liked':
        return 'لم تقم بالإعجاب بأي منتجات بعد. قم بتقييم المنتجات للحصول على توصيات مشابهة.';
      case 'new':
        return 'لا توجد منتجات جديدة حاليًا. تحقق مرة أخرى قريبًا.';
      case 'popular':
        return 'لا توجد منتجات شائعة حاليًا.';
      default:
        return 'لا توجد منتجات متاحة.';
    }
  };

  if (loading) {
    return (
      <div className="recommendations-container loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل التوصيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <h2 className="recommendations-title">
        {isAuthenticated ? 'توصيات مخصصة لك بالذكاء الاصطناعي' : 'اكتشف المنتجات'}
      </h2>
      {isAuthenticated && (
        <div className="ai-recommendation-info">
          <div className="ai-icon">
            <i className="fas fa-robot"></i>
          </div>
          <p>
            يستخدم نظام التوصيات الذكي تقنيات الذكاء الاصطناعي لتحليل تفضيلاتك وسلوكك لتقديم توصيات مخصصة لك. كلما تفاعلت أكثر مع المنتجات، كلما أصبحت التوصيات أكثر دقة.
          </p>
        </div>
      )}

      <div className="recommendations-tabs">
        {isAuthenticated && recommendations.preferred.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'preferred' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferred')}
          >
            منتجات قد تعجبك
          </button>
        )}

        {isAuthenticated && recommendations.liked.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            مشابهة لما أعجبك
          </button>
        )}

        {recommendations.new.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            جديد
          </button>
        )}

        <button
          className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          الأكثر شعبية
        </button>
      </div>

      <div className="recommendations-content">
        <h3 className="tab-title">{getTabTitle(activeTab)}</h3>

        {recommendations[activeTab].length === 0 ? (
          <p className="empty-message">{getEmptyMessage(activeTab)}</p>
        ) : (
          <div className="products-grid">
            {recommendations[activeTab].map(product => (
              <Link
                to={`/products/${product.id}`}
                className="product-card"
                key={product.id}
                onClick={() => isAuthenticated && recommendationService.trackProductView(product.id)}
              >
                <div className="product-image">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.name}
                  />
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-meta">
                    <span className="product-price">
                      {product.price} ج.م
                      {product.original_price && (
                        <span className="original-price">{product.original_price} ج.م</span>
                      )}
                    </span>
                    <div className="product-actions">
                      <span className="product-rating">
                        <span className="rating-value">{product.rating}</span>
                        <span className="rating-stars">{'★'.repeat(Math.round(product.rating))}</span>
                      </span>
                      {isAuthenticated && (
                        <button
                          className="like-button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            recommendationService.trackProductLike(product.id);
                            alert('تم تسجيل إعجابك بالمنتج');
                          }}
                          title="أعجبني"
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  {activeTab === 'preferred' && (
                    <div className="recommendation-reason">
                      مناسب لك بناءً على تفضيلاتك
                    </div>
                  )}
                  {activeTab === 'liked' && (
                    <div className="recommendation-reason">
                      مشابه للمنتجات التي أعجبتك
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="login-prompt">
          <p>قم بتسجيل الدخول للحصول على توصيات مخصصة تناسب اهتماماتك</p>
          <Link to="/login" className="login-button">تسجيل الدخول</Link>
        </div>
      )}
    </div>
  );
}

export default PersonalizedRecommendations;
