import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import './AdvancedFilter.css';

function AdvancedFilter({ products, onFilterChange }) {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    brands: [],
    categories: [],
    rating: 0,
    inStock: false,
    hasDiscount: false,
    specifications: {}
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSpecifications, setAvailableSpecifications] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000, current: { min: 0, max: 10000 } });
  const [isExpanded, setIsExpanded] = useState(false);

  // جلب الفئات من الخادم
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAll();
        if (categoriesData && categoriesData.length > 0) {
          // استخراج أسماء الفئات
          const categoryNames = categoriesData.map(category => category.name);
          setAvailableCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // استخراج البيانات المتاحة للتصفية من المنتجات
  useEffect(() => {
    if (!products || products.length === 0) return;

    // استخراج العلامات التجارية الفريدة
    const brands = [...new Set(products.map(product =>
      product.brand?.name
    ).filter(Boolean))];

    // استخراج نطاق الأسعار
    const prices = products.map(product => parseFloat(product.price)).filter(price => !isNaN(price));
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));

    // استخراج المواصفات الفريدة
    const specs = {};
    products.forEach(product => {
      if (product.specifications) {
        product.specifications.forEach(spec => {
          if (!specs[spec.name]) {
            specs[spec.name] = new Set();
          }
          if (spec.value) {
            specs[spec.name].add(spec.value);
          }
        });
      }
    });

    // تحويل قيم المواصفات من Set إلى Array
    const formattedSpecs = {};
    Object.keys(specs).forEach(key => {
      formattedSpecs[key] = Array.from(specs[key]);
    });

    setAvailableBrands(brands);
    setAvailableSpecifications(formattedSpecs);
    setPriceRange({
      min: minPrice,
      max: maxPrice,
      current: { min: minPrice, max: maxPrice }
    });

    // تحديث الفلاتر الافتراضية
    setFilters(prev => ({
      ...prev,
      priceRange: { min: minPrice, max: maxPrice }
    }));

  }, [products]);

  // تطبيق الفلاتر عند تغييرها
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // معالجة تغيير نطاق السعر
  const handlePriceRangeChange = (e, type) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      current: {
        ...prev.current,
        [type]: value
      }
    }));
  };

  // تطبيق نطاق السعر عند الانتهاء من التغيير
  const applyPriceRange = () => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange.current
    }));
  };

  // معالجة تغيير العلامة التجارية
  const handleBrandChange = (brand) => {
    setFilters(prev => {
      const updatedBrands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];

      return {
        ...prev,
        brands: updatedBrands
      };
    });
  };

  // معالجة تغيير الفئة
  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];

      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  // معالجة تغيير التقييم
  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }));
  };

  // معالجة تغيير حالة المخزون
  const handleInStockChange = () => {
    setFilters(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };

  // معالجة تغيير حالة الخصم
  const handleDiscountChange = () => {
    setFilters(prev => ({
      ...prev,
      hasDiscount: !prev.hasDiscount
    }));
  };

  // معالجة تغيير المواصفات
  const handleSpecificationChange = (specName, value) => {
    setFilters(prev => {
      const currentSpecValues = prev.specifications[specName] || [];
      const updatedSpecValues = currentSpecValues.includes(value)
        ? currentSpecValues.filter(v => v !== value)
        : [...currentSpecValues, value];

      return {
        ...prev,
        specifications: {
          ...prev.specifications,
          [specName]: updatedSpecValues
        }
      };
    });
  };

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setFilters({
      priceRange: { min: priceRange.min, max: priceRange.max },
      brands: [],
      categories: [],
      rating: 0,
      inStock: false,
      hasDiscount: false,
      specifications: {}
    });

    setPriceRange(prev => ({
      ...prev,
      current: { min: prev.min, max: prev.max }
    }));
  };

  // التبديل بين عرض وإخفاء الفلاتر على الشاشات الصغيرة
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`advanced-filter ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-header">
        <h2>تصفية متقدمة</h2>
        <button className="toggle-button" onClick={toggleExpand}>
          {isExpanded ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
        </button>
      </div>

      <div className="filter-content">
        {/* نطاق السعر */}
        <div className="filter-section">
          <h3>نطاق السعر</h3>
          <div className="price-range">
            <div className="price-inputs">
              <div className="price-input">
                <label>من</label>
                <input
                  type="number"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={priceRange.current.min}
                  onChange={(e) => handlePriceRangeChange(e, 'min')}
                />
              </div>
              <div className="price-input">
                <label>إلى</label>
                <input
                  type="number"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={priceRange.current.max}
                  onChange={(e) => handlePriceRangeChange(e, 'max')}
                />
              </div>
            </div>
            <div className="price-slider">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={priceRange.current.min}
                onChange={(e) => handlePriceRangeChange(e, 'min')}
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={priceRange.current.max}
                onChange={(e) => handlePriceRangeChange(e, 'max')}
              />
            </div>
            <button className="apply-price" onClick={applyPriceRange}>تطبيق</button>
          </div>
        </div>

        {/* العلامات التجارية */}
        {availableBrands.length > 0 && (
          <div className="filter-section">
            <h3>العلامة التجارية</h3>
            <div className="checkbox-list">
              {availableBrands.map(brand => (
                <label key={brand} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* الفئات */}
        <div className="filter-section">
          <h3>الفئة</h3>
          {availableCategories.length > 0 ? (
            <div className="checkbox-list">
              {availableCategories.map(category => (
                <label key={category} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="loading-categories">
              <div className="loading-spinner-small"></div>
              <p>جاري تحميل الفئات...</p>
            </div>
          )}
        </div>

        {/* التقييم */}
        <div className="filter-section">
          <h3>التقييم</h3>
          <div className="rating-filter">
            {[5, 4, 3, 2, 1].map(rating => (
              <div
                key={rating}
                className={`rating-option ${filters.rating === rating ? 'selected' : ''}`}
                onClick={() => handleRatingChange(rating)}
              >
                <span className="stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
                <span className="rating-text">{rating}+ نجوم</span>
              </div>
            ))}
          </div>
        </div>

        {/* خيارات إضافية */}
        <div className="filter-section">
          <h3>خيارات إضافية</h3>
          <div className="checkbox-list">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={handleInStockChange}
              />
              <span>متوفر في المخزون فقط</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.hasDiscount}
                onChange={handleDiscountChange}
              />
              <span>عروض وخصومات فقط</span>
            </label>
          </div>
        </div>

        {/* المواصفات */}
        {Object.keys(availableSpecifications).length > 0 && (
          <div className="filter-section">
            <h3>المواصفات</h3>
            {Object.entries(availableSpecifications).map(([specName, values]) => (
              <div key={specName} className="spec-filter">
                <h4>{specName}</h4>
                <div className="checkbox-list">
                  {values.map(value => (
                    <label key={`${specName}-${value}`} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={(filters.specifications[specName] || []).includes(value)}
                        onChange={() => handleSpecificationChange(specName, value)}
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* زر إعادة التعيين */}
        <button className="reset-filters" onClick={resetFilters}>
          إعادة تعيين الفلاتر
        </button>
      </div>
    </div>
  );
}

export default AdvancedFilter;
