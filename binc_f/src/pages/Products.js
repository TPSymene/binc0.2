import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/products', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setProducts(res.data);
      } catch (err) {
        console.error('فشل في تحميل المنتجات:', err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>المنتجات</h2>
      {products.length === 0 ? (
        <p>لا توجد منتجات حاليًا.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px' }}>
              <h3>{product.name}</h3>
              <p>السعر: {product.price} ج.م</p>
              <p>التصنيف: {product.category.name}</p>
              <p>التقييم: ⭐ {product.rating}</p>
              <p>{product.in_stock ? 'متوفر في المخزن ✅' : 'غير متوفر ❌'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
