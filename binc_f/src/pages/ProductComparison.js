import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductComparison.css';

function ProductComparison() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonFeatures, setComparisonFeatures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/comparison/${productId}/compare/`);
        setProduct(response.data.product);
        setSimilarProducts(response.data.similar_products);
        
        // Inicialmente seleccionamos el producto principal y hasta 2 productos similares
        const initialSelection = [response.data.product];
        if (response.data.similar_products.length > 0) {
          initialSelection.push(response.data.similar_products[0]);
        }
        if (response.data.similar_products.length > 1) {
          initialSelection.push(response.data.similar_products[1]);
        }
        setSelectedProducts(initialSelection);
        
        // Extraer características para comparar
        extractComparisonFeatures(initialSelection);
        
        setLoading(false);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات المقارنة');
        setLoading(false);
        console.error('Error fetching comparison data:', err);
      }
    };
    
    fetchData();
  }, [productId]);

  // استخراج الميزات المشتركة للمقارنة
  const extractComparisonFeatures = (products) => {
    if (!products || products.length === 0) return;
    
    const features = [
      { id: 'price', name: 'السعر', type: 'price' },
      { id: 'rating', name: 'التقييم', type: 'rating' },
      { id: 'brand', name: 'العلامة التجارية', type: 'text' },
      { id: 'category', name: 'الفئة', type: 'text' },
      { id: 'release_date', name: 'تاريخ الإصدار', type: 'date' },
      { id: 'likes', name: 'الإعجابات', type: 'number' },
      { id: 'views', name: 'المشاهدات', type: 'number' }
    ];
    
    // إضافة المواصفات الفنية إذا كانت متوفرة
    const firstProduct = products[0];
    if (firstProduct && firstProduct.specifications) {
      firstProduct.specifications.forEach(spec => {
        features.push({
          id: `spec_${spec.id}`,
          name: spec.name,
          type: 'text',
          isSpec: true,
          specId: spec.id
        });
      });
    }
    
    setComparisonFeatures(features);
  };

  // إضافة أو إزالة منتج من المقارنة
  const toggleProductSelection = (product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      // إزالة المنتج إذا كان موجودًا بالفعل
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      // إضافة المنتج إذا لم يكن موجودًا بالفعل (بحد أقصى 4 منتجات)
      if (selectedProducts.length < 4) {
        setSelectedProducts([...selectedProducts, product]);
      }
    }
  };

  // تنسيق القيم حسب نوع البيانات
  const formatValue = (product, feature) => {
    if (!product) return '-';
    
    if (feature.isSpec) {
      const spec = product.specifications?.find(s => s.id === feature.specId);
      return spec ? spec.value : '-';
    }
    
    switch (feature.id) {
      case 'price':
        return `${product.price} ج.م`;
      case 'rating':
        return (
          <div className="rating-display">
            <span>{product.rating}</span>
            <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
          </div>
        );
      case 'brand':
        return product.brand?.name || '-';
      case 'category':
        return product.category?.name || '-';
      case 'release_date':
        return product.release_date ? new Date(product.release_date).toLocaleDateString('ar-EG') : '-';
      default:
        return product[feature.id] !== undefined ? product[feature.id] : '-';
    }
  };

  // تحديد الأفضل في كل ميزة
  const getBestValueClass = (feature) => {
    if (selectedProducts.length <= 1) return {};
    
    const featureId = feature.id;
    let bestProductId = null;
    let bestValue = null;
    
    selectedProducts.forEach(product => {
      let value;
      
      if (feature.isSpec) {
        const spec = product.specifications?.find(s => s.id === feature.specId);
        value = spec ? spec.value : null;
      } else {
        value = product[featureId];
      }
      
      if (value !== undefined && value !== null) {
        if (bestValue === null) {
          bestValue = value;
          bestProductId = product.id;
        } else {
          // المقارنة حسب نوع الميزة
          switch (featureId) {
            case 'price':
              // السعر الأقل هو الأفضل
              if (parseFloat(value) < parseFloat(bestValue)) {
                bestValue = value;
                bestProductId = product.id;
              }
              break;
            case 'rating':
            case 'likes':
            case 'views':
              // القيمة الأعلى هي الأفضل
              if (parseFloat(value) > parseFloat(bestValue)) {
                bestValue = value;
                bestProductId = product.id;
              }
              break;
            default:
              // لا نحدد الأفضل للقيم النصية
              bestProductId = null;
          }
        }
      }
    });
    
    return { bestProductId };
  };

  if (loading) {
    return <div className="loading">جاري تحميل بيانات المقارنة...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-comparison-container">
      <h1 className="comparison-title">مقارنة المنتجات</h1>
      
      <div className="product-selection">
        <h2>اختر المنتجات للمقارنة (حتى 4 منتجات)</h2>
        <div className="product-selection-grid">
          {product && (
            <div 
              className={`product-card ${selectedProducts.find(p => p.id === product.id) ? 'selected' : ''}`}
              onClick={() => toggleProductSelection(product)}
            >
              <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">{product.price} ج.م</p>
              <div className="selection-indicator">
                {selectedProducts.find(p => p.id === product.id) ? '✓' : '+'}
              </div>
            </div>
          )}
          
          {similarProducts.map(similarProduct => (
            <div 
              key={similarProduct.id}
              className={`product-card ${selectedProducts.find(p => p.id === similarProduct.id) ? 'selected' : ''}`}
              onClick={() => toggleProductSelection(similarProduct)}
            >
              <img src={similarProduct.image_url || 'https://via.placeholder.com/150'} alt={similarProduct.name} />
              <h3>{similarProduct.name}</h3>
              <p className="price">{similarProduct.price} ج.م</p>
              <div className="selection-indicator">
                {selectedProducts.find(p => p.id === similarProduct.id) ? '✓' : '+'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="feature-column">الميزة</th>
              {selectedProducts.map(product => (
                <th key={product.id} className="product-column">
                  <div className="product-header">
                    <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} />
                    <h3>{product.name}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map(feature => {
              const { bestProductId } = getBestValueClass(feature);
              
              return (
                <tr key={feature.id}>
                  <td className="feature-name">{feature.name}</td>
                  {selectedProducts.map(product => (
                    <td 
                      key={`${product.id}-${feature.id}`}
                      className={bestProductId === product.id ? 'best-value' : ''}
                    >
                      {formatValue(product, feature)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="comparison-actions">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          العودة
        </button>
      </div>
    </div>
  );
}

export default ProductComparison;
