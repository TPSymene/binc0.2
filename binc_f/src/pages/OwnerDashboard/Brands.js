import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import './Brands.css';

function Brands({ shopData }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // حالة النموذج
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    popularity: 50,
    rating: 0
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.brands.getAll();
      setBrands(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('حدث خطأ أثناء جلب العلامات التجارية. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // تصفية وترتيب العلامات التجارية
  const filteredBrands = brands
    .filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'popularity':
          comparison = a.popularity - b.popularity;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // إعداد نموذج الإضافة
  const setupAddForm = () => {
    setFormMode('add');
    setSelectedBrand(null);
    setFormData({
      name: '',
      popularity: 50,
      rating: 0
    });
  };

  // إعداد نموذج التعديل
  const setupEditForm = (brand) => {
    setFormMode('edit');
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      popularity: brand.popularity,
      rating: brand.rating
    });
  };

  // معالجة تغيير حقول النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : parseFloat(value)
    });
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (formMode === 'add') {
        // إضافة علامة تجارية جديدة
        const newBrand = await dashboardService.brands.create(formData);
        setBrands([...brands, newBrand]);

        // إعادة تعيين النموذج
        setupAddForm();
      } else {
        // تعديل علامة تجارية موجودة
        const updatedBrand = await dashboardService.brands.update(selectedBrand.id, formData);

        // تحديث قائمة العلامات التجارية
        setBrands(brands.map(brand =>
          brand.id === selectedBrand.id ? updatedBrand : brand
        ));

        // إعادة تعيين النموذج
        setupAddForm();
      }

      setLoading(false);
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('حدث خطأ أثناء حفظ العلامة التجارية. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // حذف علامة تجارية
  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه العلامة التجارية؟')) {
      return;
    }

    try {
      setLoading(true);
      await dashboardService.brands.delete(brandId);

      // تحديث قائمة العلامات التجارية
      setBrands(brands.filter(brand => brand.id !== brandId));

      setLoading(false);
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('حدث خطأ أثناء حذف العلامة التجارية. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="brands-loading">
        <div className="spinner"></div>
        <p>جاري تحميل العلامات التجارية...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brands-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={fetchBrands}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="brands-page">
      <div className="brands-header">
        <h1>إدارة العلامات التجارية</h1>
      </div>

      <div className="brands-content">
        <div className="brands-form-card">
          <h2>{formMode === 'add' ? 'إضافة علامة تجارية جديدة' : 'تعديل العلامة التجارية'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">اسم العلامة التجارية</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم العلامة التجارية"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="popularity">
                الشعبية ({formData.popularity}%)
              </label>
              <input
                type="range"
                id="popularity"
                name="popularity"
                min="0"
                max="100"
                step="1"
                value={formData.popularity}
                onChange={handleInputChange}
              />
              <div className="range-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">
                التقييم ({formData.rating}/5)
              </label>
              <input
                type="range"
                id="rating"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
              />
              <div className="range-labels">
                <span>0</span>
                <span>2.5</span>
                <span>5</span>
              </div>
            </div>

            <div className="form-actions">
              {formMode === 'edit' && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={setupAddForm}
                >
                  إلغاء
                </button>
              )}
              <button type="submit" className="submit-btn">
                {formMode === 'add' ? 'إضافة العلامة التجارية' : 'تحديث العلامة التجارية'}
              </button>
            </div>
          </form>
        </div>

        <div className="brands-list-card">
          <div className="brands-list-header">
            <h2>العلامات التجارية ({filteredBrands.length})</h2>

            <div className="brands-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="بحث عن علامة تجارية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search"></i>
              </div>

              <div className="sort-group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">الاسم</option>
                  <option value="popularity">الشعبية</option>
                  <option value="rating">التقييم</option>
                </select>

                <button
                  className="sort-order-btn"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                </button>
              </div>
            </div>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="no-data">
              <p>لا توجد علامات تجارية. قم بإضافة علامة تجارية جديدة.</p>
            </div>
          ) : (
            <div className="brands-table-container">
              <table className="brands-table">
                <thead>
                  <tr>
                    <th>العلامة التجارية</th>
                    <th>الشعبية</th>
                    <th>التقييم</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map(brand => (
                    <tr key={brand.id}>
                      <td>{brand.name}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${brand.popularity}%` }}
                          ></div>
                          <span className="progress-text">{brand.popularity}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="brand-rating">
                          <div className="stars" style={{ '--rating': brand.rating }}></div>
                          <span className="rating-value">({brand.rating})</span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="edit-btn"
                          onClick={() => setupEditForm(brand)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBrand(brand.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Brands;
