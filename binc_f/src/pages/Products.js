import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import AdvancedFilter from '../components/AdvancedFilter';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import ReviewsAnalysis from '../components/ReviewsAnalysis';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndFetchProducts = async () => {
      try {
        // التحقق من وجود توكن
        if (!authService.isAuthenticated()) {
          navigate('/');
          return;
        }
        const token = authService.getToken();

        // التحقق من نوع المستخدم
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.user_type === 'owner') {
          setIsOwner(true);
          // التحقق من وجود متجر للمالك
          try {
            const shopResponse = await axios.get('http://localhost:8000/api/shop/check/', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            // إذا لم يحدث خطأ، فهذا يعني أن المستخدم لديه متجر
            console.log('Shop check response:', shopResponse.data);
            setHasShop(true);
          } catch (shopErr) {
            console.error('Shop check error:', shopErr);

            // إذا كان الخطأ 401، فقد يكون التوكن قد انتهى
            if (shopErr.response && shopErr.response.status === 401) {
              try {
                // محاولة تحديث التوكن
                await authService.refreshToken();
                const newToken = authService.getToken();

                // إعادة المحاولة بالتوكن الجديد
                const shopResponse = await axios.get('http://localhost:8000/api/shop/check/', {
                  headers: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                console.log('Shop check response after token refresh:', shopResponse.data);
                setHasShop(true);
              } catch (refreshErr) {
                console.error('Error refreshing token:', refreshErr);
                // إذا فشل تحديث التوكن، نعيد توجيه المستخدم إلى صفحة تسجيل الدخول
                navigate('/');
              }
            } else if (shopErr.response && shopErr.response.status === 404) {
              // إذا كان الخطأ 404، فهذا يعني أن المستخدم ليس لديه متجر
              navigate('/register-shop');
              return;
            }
          }
        }

        // جلب المنتجات
        console.log('Fetching products...');
        try {
          const res = await axios.get('http://localhost:8000/api/products/', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Products response:', res.data);
          setProducts(res.data);
          setFilteredProducts(res.data);
        } catch (productErr) {
          console.error('Error fetching products:', productErr);

          // إذا كان الخطأ 401، فقد يكون التوكن قد انتهى
          if (productErr.response && productErr.response.status === 401) {
            try {
              // محاولة تحديث التوكن
              await authService.refreshToken();
              const newToken = authService.getToken();

              // إعادة المحاولة بالتوكن الجديد
              const res = await axios.get('http://localhost:8000/api/products/', {
                headers: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              console.log('Products response after token refresh:', res.data);
              setProducts(res.data);
              setFilteredProducts(res.data);
            } catch (refreshErr) {
              console.error('Error refreshing token:', refreshErr);
              // إذا فشل تحديث التوكن، نعيد توجيه المستخدم إلى صفحة تسجيل الدخول
              navigate('/');
            }
          } else {
            setError('حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى. التفاصيل: ' +
              (productErr.response ? `رمز الخطأ: ${productErr.response.status}` : 'لا يمكن الوصول إلى الخادم'));
          }
        }
      } catch (err) {
        console.error('فشل في تحميل المنتجات:', err);

        if (err.response && err.response.status === 401) {
          // إذا كان الخطأ 401، فهذا يعني أن المستخدم غير مصرح له
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          navigate('/');
        } else {
          setError('حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchProducts();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>جاري تحميل المنتجات...</h2>
      </div>
    );
  }

  // دالة للانتقال إلى لوحة التحكم
  const goToDashboard = () => {
    navigate('/owner-dashboard');
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (filters) => {
    if (!products || products.length === 0) return;

    let filtered = [...products];

    // تطبيق فلتر نطاق السعر
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // تطبيق فلتر العلامات التجارية
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && filters.brands.includes(product.brand.name)
      );
    }

    // تطبيق فلتر الفئات
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.category && filters.categories.includes(product.category.name)
      );
    }

    // تطبيق فلتر التقييم
    if (filters.rating > 0) {
      filtered = filtered.filter(product =>
        parseFloat(product.rating) >= filters.rating
      );
    }

    // تطبيق فلتر المخزون
    if (filters.inStock) {
      filtered = filtered.filter(product => product.in_stock);
    }

    // تطبيق فلتر الخصم
    if (filters.hasDiscount) {
      filtered = filtered.filter(product =>
        product.original_price && parseFloat(product.original_price) > parseFloat(product.price)
      );
    }

    // تطبيق فلتر المواصفات
    if (filters.specifications && Object.keys(filters.specifications).length > 0) {
      filtered = filtered.filter(product => {
        if (!product.specifications) return false;

        // التحقق من كل مواصفة مطلوبة
        for (const [specName, specValues] of Object.entries(filters.specifications)) {
          if (specValues.length === 0) continue;

          // البحث عن المواصفة في المنتج
          const productSpec = product.specifications.find(spec => spec.name === specName);
          if (!productSpec || !specValues.includes(productSpec.value)) {
            return false;
          }
        }

        return true;
      });
    }

    setFilteredProducts(filtered);
  };

  // تحديد المنتج المحدد للتحليل
  const selectProduct = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>المنتجات</h1>
        {isOwner && hasShop && (
          <button
            onClick={goToDashboard}
            className="dashboard-button"
          >
            <span role="img" aria-label="إعدادات">⚙️</span> لوحة تحكم المتجر
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="products-layout">
        <div className="filter-sidebar">
          <AdvancedFilter
            products={products}
            onFilterChange={handleFilterChange}
          />

          {/* التوصيات الشخصية */}
          <PersonalizedRecommendations />
        </div>

        <div className="products-main">
          {filteredProducts.length === 0 ? (
            <div className="empty-message">
              <p>لا توجد منتجات تطابق معايير البحث.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => selectProduct(product)}>
                  <div className="product-image">
                    <img src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} />
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className="discount-badge">
                        -{Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-meta">
                      <div className="product-price">
                        {product.price} ج.م
                        {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                          <span className="original-price">{product.original_price} ج.م</span>
                        )}
                      </div>
                      <div className="product-rating">
                        <span className="rating-value">{product.rating}</span>
                        <span className="rating-stars">{'\u2605'.repeat(Math.round(product.rating))}</span>
                      </div>
                    </div>
                    <div className="product-category">الفئة: {product.category?.name || 'غير مصنف'}</div>
                    <div className={`product-stock ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.in_stock ? '✅ متوفر في المخزون' : '❌ غير متوفر'}
                    </div>
                    <div className="product-actions">
                      <Link to={`/products/${product.id}`} className="action-button view-button">عرض التفاصيل</Link>
                      <Link to={`/products/${product.id}/compare`} className="action-button compare-button">مقارنة</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* تحليل التعليقات للمنتج المحدد */}
          {selectedProduct && (
            <ReviewsAnalysis productId={selectedProduct.id} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
