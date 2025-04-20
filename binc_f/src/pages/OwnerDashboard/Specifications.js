import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import './Specifications.css';

function Specifications({ shopData }) {
  const [specCategories, setSpecCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');

  // حالة النماذج
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecCategoryId, setNewSpecCategoryId] = useState('');
  const [editSpecId, setEditSpecId] = useState(null);
  const [editSpecName, setEditSpecName] = useState('');
  const [editSpecCategoryId, setEditSpecCategoryId] = useState('');

  useEffect(() => {
    fetchSpecifications();
  }, []);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.specifications.getCategories();
      setSpecCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching specifications:', error);
      setError('حدث خطأ أثناء جلب المواصفات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // إضافة فئة مواصفات جديدة
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      alert('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      setLoading(true);
      const newCategory = await dashboardService.specifications.addCategory({
        category_name: newCategoryName
      });

      setSpecCategories([...specCategories, newCategory]);
      setNewCategoryName('');
      setLoading(false);
    } catch (error) {
      console.error('Error adding specification category:', error);
      alert('حدث خطأ أثناء إضافة فئة المواصفات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // تعديل فئة مواصفات
  const handleEditCategory = async (e) => {
    e.preventDefault();

    if (!editCategoryName.trim()) {
      alert('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      setLoading(true);
      const updatedCategory = await dashboardService.specifications.updateCategory(editCategoryId, {
        category_name: editCategoryName
      });

      setSpecCategories(specCategories.map(category =>
        category.id === editCategoryId ? updatedCategory : category
      ));

      setEditCategoryId(null);
      setEditCategoryName('');
      setLoading(false);
    } catch (error) {
      console.error('Error updating specification category:', error);
      alert('حدث خطأ أثناء تعديل فئة المواصفات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // حذف فئة مواصفات
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الفئة؟ سيتم حذف جميع المواصفات المرتبطة بها.')) {
      return;
    }

    try {
      setLoading(true);
      await dashboardService.specifications.deleteCategory(categoryId);

      setSpecCategories(specCategories.filter(category => category.id !== categoryId));
      setLoading(false);
    } catch (error) {
      console.error('Error deleting specification category:', error);
      alert('حدث خطأ أثناء حذف فئة المواصفات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // إضافة مواصفة جديدة
  const handleAddSpecification = async (e) => {
    e.preventDefault();

    if (!newSpecName.trim() || !newSpecCategoryId) {
      alert('يرجى إدخال اسم المواصفة واختيار الفئة');
      return;
    }

    try {
      setLoading(true);
      const newSpec = await dashboardService.specifications.addSpecification({
        specification_name: newSpecName,
        category_id: newSpecCategoryId
      });

      // تحديث قائمة المواصفات في الفئة المناسبة
      setSpecCategories(specCategories.map(category => {
        if (category.id === newSpecCategoryId) {
          return {
            ...category,
            specifications: [...(category.specifications || []), newSpec]
          };
        }
        return category;
      }));

      setNewSpecName('');
      setNewSpecCategoryId('');
      setLoading(false);
    } catch (error) {
      console.error('Error adding specification:', error);
      alert('حدث خطأ أثناء إضافة المواصفة. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // تعديل مواصفة
  const handleEditSpecification = async (e) => {
    e.preventDefault();

    if (!editSpecName.trim() || !editSpecCategoryId) {
      alert('يرجى إدخال اسم المواصفة واختيار الفئة');
      return;
    }

    try {
      setLoading(true);
      const updatedSpec = await dashboardService.specifications.updateSpecification(editSpecId, {
        specification_name: editSpecName,
        category_id: editSpecCategoryId
      });

      // تحديث قائمة المواصفات
      const updatedCategories = specCategories.map(category => {
        // إذا كانت الفئة الحالية هي الفئة القديمة للمواصفة، نزيل المواصفة منها
        if (category.specifications) {
          category.specifications = category.specifications.filter(spec => spec.id !== editSpecId);
        }

        // إذا كانت الفئة الحالية هي الفئة الجديدة للمواصفة، نضيف المواصفة إليها
        if (category.id === editSpecCategoryId) {
          return {
            ...category,
            specifications: [...(category.specifications || []), updatedSpec]
          };
        }

        return category;
      });

      setSpecCategories(updatedCategories);
      setEditSpecId(null);
      setEditSpecName('');
      setEditSpecCategoryId('');
      setLoading(false);
    } catch (error) {
      console.error('Error updating specification:', error);
      alert('حدث خطأ أثناء تعديل المواصفة. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // حذف مواصفة
  const handleDeleteSpecification = async (specId, categoryId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه المواصفة؟')) {
      return;
    }

    try {
      setLoading(true);
      await dashboardService.specifications.deleteSpecification(specId);

      // تحديث قائمة المواصفات
      setSpecCategories(specCategories.map(category => {
        if (category.id === categoryId && category.specifications) {
          return {
            ...category,
            specifications: category.specifications.filter(spec => spec.id !== specId)
          };
        }
        return category;
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error deleting specification:', error);
      alert('حدث خطأ أثناء حذف المواصفة. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  // إعداد نموذج تعديل فئة
  const setupEditCategory = (category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.category_name);
    setActiveTab('categories');
  };

  // إعداد نموذج تعديل مواصفة
  const setupEditSpecification = (spec, categoryId) => {
    setEditSpecId(spec.id);
    setEditSpecName(spec.specification_name);
    setEditSpecCategoryId(categoryId);
    setActiveTab('specifications');
  };

  // حساب إجمالي المواصفات
  const getTotalSpecifications = () => {
    return specCategories.reduce((total, category) =>
      total + (category.specifications ? category.specifications.length : 0), 0);
  };

  if (loading && specCategories.length === 0) {
    return (
      <div className="specifications-loading">
        <div className="spinner"></div>
        <p>جاري تحميل المواصفات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="specifications-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ</h2>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={fetchSpecifications}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="specifications-page">
      <div className="specifications-header">
        <h1>إدارة المواصفات</h1>
      </div>

      <div className="specifications-stats">
        <div className="stat-item">
          <span className="stat-value">{specCategories.length}</span>
          <span className="stat-label">فئات المواصفات</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getTotalSpecifications()}</span>
          <span className="stat-label">إجمالي المواصفات</span>
        </div>
      </div>

      <div className="specifications-tabs">
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          فئات المواصفات
        </button>
        <button
          className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('specifications')}
        >
          المواصفات
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div className="specifications-content">
          <div className="specifications-form-card">
            <h2>{editCategoryId ? 'تعديل فئة المواصفات' : 'إضافة فئة مواصفات جديدة'}</h2>
            <form onSubmit={editCategoryId ? handleEditCategory : handleAddCategory}>
              <div className="form-group">
                <label htmlFor="categoryName">اسم الفئة</label>
                <input
                  type="text"
                  id="categoryName"
                  value={editCategoryId ? editCategoryName : newCategoryName}
                  onChange={(e) => editCategoryId ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
                  placeholder="أدخل اسم فئة المواصفات"
                  required
                />
              </div>

              <div className="form-actions">
                {editCategoryId && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setEditCategoryId(null);
                      setEditCategoryName('');
                    }}
                  >
                    إلغاء
                  </button>
                )}
                <button type="submit" className="submit-btn">
                  {editCategoryId ? 'تحديث الفئة' : 'إضافة فئة'}
                </button>
              </div>
            </form>
          </div>

          <div className="specifications-list-card">
            <h2>فئات المواصفات</h2>
            {specCategories.length === 0 ? (
              <div className="no-data">
                <p>لا توجد فئات مواصفات. قم بإضافة فئة جديدة.</p>
              </div>
            ) : (
              <div className="categories-list">
                {specCategories.map(category => (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      <h3>{category.category_name}</h3>
                      <span className="specs-count">
                        {category.specifications ? category.specifications.length : 0} مواصفة
                      </span>
                    </div>
                    <div className="category-actions">
                      <button
                        className="edit-btn"
                        onClick={() => setupEditCategory(category)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="specifications-content">
          <div className="specifications-form-card">
            <h2>{editSpecId ? 'تعديل المواصفة' : 'إضافة مواصفة جديدة'}</h2>
            <form onSubmit={editSpecId ? handleEditSpecification : handleAddSpecification}>
              <div className="form-group">
                <label htmlFor="specName">اسم المواصفة</label>
                <input
                  type="text"
                  id="specName"
                  value={editSpecId ? editSpecName : newSpecName}
                  onChange={(e) => editSpecId ? setEditSpecName(e.target.value) : setNewSpecName(e.target.value)}
                  placeholder="أدخل اسم المواصفة"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="specCategory">فئة المواصفة</label>
                <select
                  id="specCategory"
                  value={editSpecId ? editSpecCategoryId : newSpecCategoryId}
                  onChange={(e) => editSpecId ? setEditSpecCategoryId(e.target.value) : setNewSpecCategoryId(e.target.value)}
                  required
                >
                  <option value="">اختر فئة المواصفة</option>
                  {specCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                {editSpecId && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setEditSpecId(null);
                      setEditSpecName('');
                      setEditSpecCategoryId('');
                    }}
                  >
                    إلغاء
                  </button>
                )}
                <button type="submit" className="submit-btn">
                  {editSpecId ? 'تحديث المواصفة' : 'إضافة مواصفة'}
                </button>
              </div>
            </form>
          </div>

          <div className="specifications-list-card">
            <h2>المواصفات</h2>
            {getTotalSpecifications() === 0 ? (
              <div className="no-data">
                <p>لا توجد مواصفات. قم بإضافة مواصفة جديدة.</p>
              </div>
            ) : (
              <div className="specifications-accordion">
                {specCategories.map(category => (
                  <div key={category.id} className="accordion-item">
                    <div className="accordion-header">
                      <h3>{category.category_name}</h3>
                      <span className="specs-count">
                        {category.specifications ? category.specifications.length : 0} مواصفة
                      </span>
                    </div>

                    {category.specifications && category.specifications.length > 0 && (
                      <div className="accordion-content">
                        <table className="specifications-table">
                          <thead>
                            <tr>
                              <th>اسم المواصفة</th>
                              <th>الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.specifications.map(spec => (
                              <tr key={spec.id}>
                                <td>{spec.specification_name}</td>
                                <td className="actions-cell">
                                  <button
                                    className="edit-btn"
                                    onClick={() => setupEditSpecification(spec, category.id)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteSpecification(spec.id, category.id)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Specifications;
