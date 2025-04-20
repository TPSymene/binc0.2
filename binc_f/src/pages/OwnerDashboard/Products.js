import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './Products.css';

function Products({ shopData }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // جلب المنتجات
        const productsData = await dashboardService.products.getAll();

        if (Array.isArray(productsData)) {
          setProducts(productsData);
          setFilteredProducts(productsData);

          // استخراج الفئات الفريدة
          const uniqueCategories = [...new Set(productsData.map(product => product.category?.name).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          console.error('Products data is not an array:', productsData);
          // إذا لم تكن البيانات مصفوفة، نستخدم بيانات وهمية للعرض
          const mockProducts = [
            {
              id: 'PRD-001',
              name: 'هاتف ذكي',
              description: 'هاتف ذكي بمواصفات عالية',
              price: 1200,
              original_price: 1500,
              category: { id: 'CAT-001', name: 'إلكترونيات' },
              image_url: 'https://via.placeholder.com/150',
              stock: 8,
              sales: 15,
              rating: 4.5,
              is_active: true,
              created_at: '2023-05-10'
            },
            {
              id: 'PRD-002',
              name: 'لابتوب',
              description: 'لابتوب للألعاب والعمل',
              price: 3500,
              original_price: 4000,
              category: { id: 'CAT-001', name: 'إلكترونيات' },
              image_url: 'https://via.placeholder.com/150',
              stock: 5,
              sales: 10,
              rating: 4.2,
              is_active: true,
              created_at: '2023-05-12'
            },
            {
              id: 'PRD-003',
              name: 'سماعات لاسلكية',
              description: 'سماعات لاسلكية بجودة صوت عالية',
              price: 350,
              original_price: 400,
              category: { id: 'CAT-002', name: 'اكسسوارات' },
              image_url: 'https://via.placeholder.com/150',
              stock: 20,
              sales: 30,
              rating: 4.7,
              is_active: true,
              created_at: '2023-05-15'
            }
          ];

          setProducts(mockProducts);
          setFilteredProducts(mockProducts);

          // استخراج الفئات الفريدة
          const uniqueCategories = [...new Set(mockProducts.map(product => product.category?.name).filter(Boolean))];
          setCategories(uniqueCategories);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('حدث خطأ أثناء جلب المنتجات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // تصفية المنتجات بناءً على البحث والفئة
  useEffect(() => {
    let result = [...products];

    // تصفية حسب البحث
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الفئة
    if (selectedCategory) {
      result = result.filter(product => product.category?.name === selectedCategory);
    }

    // ترتيب المنتجات
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'sales':
          comparison = (a.sales || 0) - (b.sales || 0);
          break;
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(result);
    setCurrentPage(1); // إعادة تعيين الصفحة الحالية عند تغيير التصفية
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  // حساب المنتجات للصفحة الحالية
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // تغيير حالة المنتج (نشط/غير نشط)
  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await dashboardService.products.update(productId, { is_active: !currentStatus });

      // تحديث حالة المنتج في القائمة
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, is_active: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('حدث خطأ أثناء تحديث حالة المنتج. يرجى المحاولة مرة أخرى.');
    }
  };

  // حذف منتج
  const deleteProduct = async (productId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      try {
        await dashboardService.products.delete(productId);

        // إزالة المنتج من القائمة
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>إدارة المنتجات</h1>
        <button
          className="add-product-btn"
          onClick={() => navigate('/owner-dashboard/products/add')}
        >
          <i className="fas fa-plus"></i> إضافة منتج جديد
        </button>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">جميع الفئات</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="sort-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">الاسم</option>
            <option value="price">السعر</option>
            <option value="rating">التقييم</option>
            <option value="sales">المبيعات</option>
            <option value="date">تاريخ الإضافة</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      <div className="products-stats">
        <div className="stat-item">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">إجمالي المنتجات</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{products.filter(p => p.is_active).length}</span>
          <span className="stat-label">المنتجات النشطة</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{products.filter(p => !p.is_active).length}</span>
          <span className="stat-label">المنتجات غير النشطة</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{categories.length}</span>
          <span className="stat-label">الفئات</span>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-data-icon">
            <i className="fas fa-box-open"></i>
          </div>
          <h2>لا توجد منتجات</h2>
          <p>لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.</p>
          {searchTerm || selectedCategory ? (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              مسح عوامل التصفية
            </button>
          ) : (
            <button
              className="add-product-btn"
              onClick={() => navigate('/owner-dashboard/products/add')}
            >
              إضافة منتج جديد
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الفئة</th>
                  <th>السعر</th>
                  <th>التقييم</th>
                  <th>المخزون</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(product => (
                  <tr key={product.id}>
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
                        <div className="product-details">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-id">ID: {product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || 'غير مصنف'}</td>
                    <td className="price-cell">
                      <div className="product-price">
                        <span className="current-price">{product.price} ريال</span>
                        {product.original_price && (
                          <span className="original-price">{product.original_price} ريال</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-rating">
                        <div className="stars" style={{ '--rating': product.rating }}></div>
                        <span className="rating-value">({product.rating})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                        {product.in_stock ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </td>
                    <td>
                      <div className="status-toggle">
                        <input
                          type="checkbox"
                          id={`status-${product.id}`}
                          checked={product.is_active}
                          onChange={() => toggleProductStatus(product.id, product.is_active)}
                        />
                        <label htmlFor={`status-${product.id}`}></label>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/owner-dashboard/products/edit/${product.id}`}
                        className="edit-btn"
                        title="تعديل"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="delete-btn"
                        title="حذف"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
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

export default Products;
