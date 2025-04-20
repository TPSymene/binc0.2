import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dashboardService from '../../../services/dashboardService';
import categoryService from '../../../services/categoryService';
import './ProductForm.css';

function ProductForm({ shop }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!productId;

  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    category_id: '',
    brand: '',
    brand_id: '',
    image_url: '',
    video_url: '',
    release_date: '',
    likes: 0,
    dislikes: 0,
    neutrals: 0,
    views: 0,
    rating: 5,
    is_active: true,
    in_stock: true,
    is_banned: false
  });

  // حالة الخطأ والتحميل
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // حالة البيانات المرجعية
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // حالة معاينة الصورة
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // جلب الفئات والعلامات التجارية
    const fetchReferenceData = async () => {
      try {
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);

        const brandsData = await dashboardService.brands.getAll();
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();

    // إذا كنا في وضع التعديل، نقوم بجلب بيانات المنتج
    if (isEditMode) {
      const fetchProductData = async () => {
        try {
          setLoading(true);
          const productData = await dashboardService.products.getById(productId);

          setFormData({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.original_price || '',
            category: productData.category?.name || '',
            category_id: productData.category?.id || '',
            brand: productData.brand?.name || '',
            brand_id: productData.brand?.id || '',
            image_url: productData.image_url || '',
            video_url: productData.video_url || '',
            release_date: productData.release_date || '',
            likes: productData.likes || 0,
            dislikes: productData.dislikes || 0,
            neutrals: productData.neutrals || 0,
            views: productData.views || 0,
            rating: productData.rating || 0,
            is_active: productData.is_active !== undefined ? productData.is_active : true,
            in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
            is_banned: productData.is_banned !== undefined ? productData.is_banned : false
          });

          if (productData.image_url) {
            setImagePreview(productData.image_url);
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching product data:', error);
          setLoading(false);

          // إذا لم يتم العثور على المنتج، نعود إلى صفحة المنتجات
          navigate('/owner-dashboard/products');
        }
      };

      fetchProductData();
    }
  }, [productId, isEditMode, navigate]);

  // التعامل مع تغيير الحقول
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // إزالة الخطأ عند تغيير القيمة
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // التعامل مع تغيير الصورة
  const handleImageChange = (e) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      image_url: value
    });

    // إذا كان الرابط صحيحًا، نقوم بتحديث المعاينة
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      setImagePreview(value);
    } else {
      setImagePreview(null);
    }

    // إزالة الخطأ عند تغيير الصورة
    if (errors.image_url) {
      setErrors({
        ...errors,
        image_url: null
      });
    }
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};

    // التحقق من الحقول المطلوبة
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المنتج مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المنتج مطلوب';
    }

    if (!formData.price) {
      newErrors.price = 'سعر المنتج مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'يجب أن يكون السعر رقمًا موجبًا';
    }

    if (!formData.category_id) {
      newErrors.category = 'فئة المنتج مطلوبة';
    }

    if (!formData.image_url) {
      newErrors.image_url = 'صورة المنتج مطلوبة';
    }

    // التحقق من التقييم
    if (isNaN(formData.rating) || parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5) {
      newErrors.rating = 'يجب أن يكون التقييم رقمًا بين 0 و 5';
    }

    // التحقق من القيم العددية
    if (formData.likes && (isNaN(formData.likes) || parseInt(formData.likes) < 0)) {
      newErrors.likes = 'يجب أن يكون عدد الإعجابات رقمًا غير سالب';
    }

    if (formData.dislikes && (isNaN(formData.dislikes) || parseInt(formData.dislikes) < 0)) {
      newErrors.dislikes = 'يجب أن يكون عدد عدم الإعجابات رقمًا غير سالب';
    }

    if (formData.neutrals && (isNaN(formData.neutrals) || parseInt(formData.neutrals) < 0)) {
      newErrors.neutrals = 'يجب أن يكون عدد التقييمات المحايدة رقمًا غير سالب';
    }

    if (formData.views && (isNaN(formData.views) || parseInt(formData.views) < 0)) {
      newErrors.views = 'يجب أن يكون عدد المشاهدات رقمًا غير سالب';
    }

    return newErrors;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من صحة النموذج
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setSubmitting(true);
      setSuccess(null);

      // تحويل القيم إلى الأنواع المناسبة
      const price = parseFloat(formData.price);
      const original_price = formData.original_price ? parseFloat(formData.original_price) : null;
      const rating = parseFloat(formData.rating) || 0;

      // التحقق من صحة القيم العددية
      if (isNaN(price) || price <= 0) {
        throw new Error('يجب أن يكون السعر رقمًا موجبًا');
      }

      if (original_price !== null && (isNaN(original_price) || original_price <= 0)) {
        throw new Error('يجب أن يكون السعر الأصلي رقمًا موجبًا');
      }

      if (isNaN(rating) || rating < 0 || rating > 5) {
        throw new Error('يجب أن يكون التقييم رقمًا بين 0 و 5');
      }

      // إعداد بيانات المنتج
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        original_price: original_price,
        category_id: formData.category_id,
        brand_id: formData.brand_id || null,
        image_url: formData.image_url.trim(),
        video_url: formData.video_url ? formData.video_url.trim() : null,
        release_date: formData.release_date || null,
        likes: parseInt(formData.likes) || 0,
        dislikes: parseInt(formData.dislikes) || 0,
        neutrals: parseInt(formData.neutrals) || 0,
        views: parseInt(formData.views) || 0,
        rating: rating,
        is_active: formData.is_active,
        in_stock: formData.in_stock,
        is_banned: formData.is_banned
      };

      /**
       * إضافة البيانات المطلوبة للتوافق مع الباك إند
       *
       * ملاحظات عن التوافق:
       * - الباك إند يتوقع حقول محددة مثل stock و stock_quantity
       * - يجب إرسال كل من category_id و category للتوافق مع الباك إند
       * - إذا كان المتجر متوفرًا، يجب إرسال shop_id لربط المنتج بالمتجر
       */

      // إضافة الفئة كنص أيضًا
      if (formData.category_id) {
        const selectedCategory = categories.find(cat => cat.id === formData.category_id);
        if (selectedCategory) {
          productData.category = selectedCategory.name;
        }
      }

      // إضافة حقل stock للمخزون
      productData.stock = 10; // قيمة افتراضية للمخزون

      // إضافة حقل shop_id إذا كان متوفرًا
      if (shop && shop.id) {
        productData.shop_id = shop.id;
      }

      console.log('Sending product data:', productData);

      if (isEditMode) {
        // تحديث منتج موجود
        const response = await dashboardService.products.update(productId, productData);
        console.log('Product update response:', response);
        setSuccess('تم تحديث المنتج بنجاح');
      } else {
        // إضافة منتج جديد
        const response = await dashboardService.products.create(productData);
        console.log('Product create response:', response);
        setSuccess('تم إضافة المنتج بنجاح');

        // إعادة تعيين النموذج بعد الإضافة
        setFormData({
          name: '',
          description: '',
          price: '',
          original_price: '',
          category: '',
          category_id: '',
          brand: '',
          brand_id: '',
          image_url: '',
          video_url: '',
          release_date: '',
          likes: 0,
          dislikes: 0,
          neutrals: 0,
          views: 0,
          rating: 5,
          is_active: true,
          in_stock: true,
          is_banned: false
        });
        setImagePreview('');
      }

      setSubmitting(false);

      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitting(false);

      // تحليل رسالة الخطأ للحصول على تفاصيل أكثر
      let errorMessage = 'حدث خطأ أثناء حفظ المنتج. يرجى المحاولة مرة أخرى.';

      if (error.response && error.response.data) {
        // إذا كان هناك رد من الخادم يحتوي على تفاصيل الخطأ
        const serverErrors = error.response.data;
        console.log('Server validation errors:', serverErrors);

        if (typeof serverErrors === 'object') {
          // إذا كانت الأخطاء على شكل كائن مع حقول
          const fieldErrors = {};
          let hasFieldErrors = false;

          // تحويل أخطاء الحقول من الخادم إلى تنسيق مناسب للعرض
          Object.keys(serverErrors).forEach(field => {
            if (field !== 'error' && field !== 'detail') {
              fieldErrors[field] = Array.isArray(serverErrors[field])
                ? serverErrors[field][0]
                : serverErrors[field];
              hasFieldErrors = true;
            }
          });

          if (hasFieldErrors) {
            // إذا كانت هناك أخطاء في حقول محددة، نعرضها
            setErrors(fieldErrors);
            return;
          } else if (serverErrors.error) {
            // إذا كان هناك خطأ عام
            errorMessage = serverErrors.error;
          } else if (serverErrors.detail) {
            // إذا كان هناك تفاصيل للخطأ
            errorMessage = serverErrors.detail;
          }
        } else if (typeof serverErrors === 'string') {
          // إذا كانت رسالة الخطأ نصية
          errorMessage = serverErrors;
        }
      } else if (error.message) {
        // إذا كان الخطأ من الفرونت إند
        errorMessage = error.message;
      }

      setErrors({
        submit: errorMessage
      });
    }
  };

  if (loading) {
    return (
      <div className="product-form-loading">
        <div className="spinner"></div>
        <p>جاري تحميل بيانات المنتج...</p>
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <div className="product-form-header">
        <h1>{isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h1>
        <button
          className="back-btn"
          onClick={() => navigate('/owner-dashboard/products')}
        >
          <i className="fas fa-arrow-right"></i> العودة إلى المنتجات
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      {errors.submit && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>المعلومات الأساسية</h2>

          <div className="form-group">
            <label htmlFor="name">اسم المنتج *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم المنتج"
              required
            />
            {errors.name && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">وصف المنتج *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصف المنتج"
              rows="4"
              required
            ></textarea>
            {errors.description && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">السعر *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="أدخل سعر المنتج"
                min="0.01"
                step="0.01"
                required
              />
              {errors.price && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.price}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="original_price">السعر الأصلي</label>
              <input
                type="number"
                id="original_price"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="أدخل السعر الأصلي (اختياري)"
                min="0.01"
                step="0.01"
              />
              {errors.original_price && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.original_price}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">فئة المنتج *</label>
              <select
                id="category_id"
                name="category_id"
                className="form-control"
                value={formData.category_id || ''}
                onChange={handleChange}
              >
                <option value="">اختر فئة</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.category && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="brand">العلامة التجارية</label>
              <select
                id="brand"
                name="brand_id"
                className="form-control"
                value={formData.brand_id || ''}
                onChange={handleChange}
              >
                <option value="">اختر علامة تجارية</option>
                {brands.map(brand => (
                  <option key={brand.id || brand.name} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {errors.brand && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.brand}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>الوسائط</h2>

          <div className="form-group">
            <label htmlFor="image_url">رابط صورة المنتج *</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleImageChange}
              placeholder="أدخل رابط صورة المنتج"
              required
            />
            {errors.image_url && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.image_url}</div>}

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="معاينة المنتج" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="video_url">رابط فيديو المنتج</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="أدخل رابط فيديو المنتج (اختياري)"
            />
            {errors.video_url && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.video_url}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="release_date">تاريخ الإصدار</label>
            <input
              type="date"
              id="release_date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
            />
            {errors.release_date && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.release_date}</div>}
          </div>
        </div>

        <div className="form-section">
          <h2>الإحصائيات والحالة</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rating">التقييم (0-5) *</label>
              <input
                type="number"
                id="rating"
                name="rating"
                className="form-control"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
              {errors.rating && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.rating}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="likes">عدد الإعجابات</label>
              <input
                type="number"
                id="likes"
                name="likes"
                className="form-control"
                min="0"
                value={formData.likes}
                onChange={handleChange}
              />
              {errors.likes && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.likes}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="dislikes">عدد عدم الإعجابات</label>
              <input
                type="number"
                id="dislikes"
                name="dislikes"
                className="form-control"
                min="0"
                value={formData.dislikes}
                onChange={handleChange}
              />
              {errors.dislikes && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.dislikes}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="neutrals">عدد التقييمات المحايدة</label>
              <input
                type="number"
                id="neutrals"
                name="neutrals"
                className="form-control"
                min="0"
                value={formData.neutrals}
                onChange={handleChange}
              />
              {errors.neutrals && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.neutrals}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="views">عدد المشاهدات</label>
              <input
                type="number"
                id="views"
                name="views"
                className="form-control"
                min="0"
                value={formData.views}
                onChange={handleChange}
              />
              {errors.views && <div style={{ color: '#F44336', fontSize: '0.8rem', marginTop: '5px' }}>{errors.views}</div>}
            </div>
          </div>

          <div className="form-row checkboxes">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active">نشط</label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="in_stock"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
              />
              <label htmlFor="in_stock">متوفر في المخزون</label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="is_banned"
                name="is_banned"
                checked={formData.is_banned}
                onChange={handleChange}
              />
              <label htmlFor="is_banned">محظور</label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/owner-dashboard/products')}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="sr-only">جاري الحفظ...</span>
              </>
            ) : (
              isEditMode ? 'تحديث المنتج' : 'إضافة المنتج'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
