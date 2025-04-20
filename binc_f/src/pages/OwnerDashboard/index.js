import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './Dashboard';
import Products from './Products';
import ProductForm from './components/ProductForm';
// تم إزالة استيراد صفحات الطلبات
import ShopSettings from './ShopSettings';
import Analytics from './Analytics';
import Specifications from './Specifications';
import Brands from './Brands';
import Notifications from './Notifications';
import authService from '../../services/authService';
import dashboardService from '../../services/dashboardService';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('Checking owner access...');
        // التحقق من صلاحيات المستخدم
        const hasAccess = await dashboardService.checkOwnerAccess();
        console.log('Access check result:', hasAccess);

        if (!hasAccess) {
          setError('لا يمكن الوصول إلى لوحة التحكم. يرجى تسجيل الدخول كمالك متجر.');
          setLoading(false);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // جلب بيانات المالك والمتجر
        const userData = authService.getCurrentUser();
        console.log('User data:', userData);
        setOwnerData(userData);

        // جلب بيانات المتجر
        console.log('Fetching shop details...');
        try {
          const shopResponse = await dashboardService.shop.getDetails();
          console.log('Shop data:', shopResponse);
          setShopData(shopResponse);
        } catch (shopError) {
          console.error('Error fetching shop data:', shopError);
          setError('لم يتم العثور على متجر مرتبط بحسابك. يرجى إنشاء متجر أولاً.');
          setLoading(false);
          setTimeout(() => navigate('/register-shop'), 3000);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking access or fetching shop data:', error);

        // تحديد نوع الخطأ وعرض رسالة مناسبة
        let errorMessage = 'لا يمكن الوصول إلى لوحة التحكم. يرجى تسجيل الدخول كمالك متجر.';
        let redirectPath = '/';

        if (error.message === 'User not authenticated') {
          errorMessage = 'يجب تسجيل الدخول للوصول إلى لوحة التحكم.';
          redirectPath = '/';
        } else if (error.message === 'User is not an owner') {
          errorMessage = 'لا يمكن الوصول إلى لوحة التحكم. يجب أن تكون مالك متجر.';
          redirectPath = '/products';
        } else if (error.message === 'No shop data found') {
          errorMessage = 'لم يتم العثور على متجر مرتبط بحسابك. يرجى إنشاء متجر أولاً.';
          redirectPath = '/register-shop';
        }

        setError(errorMessage);
        setLoading(false);

        // إعادة توجيه المستخدم إلى الصفحة المناسبة بعد فترة قصيرة
        setTimeout(() => {
          navigate(redirectPath);
        }, 3000);
      }
    };

    checkAccess();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon"><span role="img" aria-label="تحذير">⚠️</span></div>
        <h2>خطأ في الوصول</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} shopData={shopData} ownerData={ownerData} />

      <div className={`dashboard-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Header toggleSidebar={toggleSidebar} ownerData={ownerData} shopData={shopData} />

        <div className="dashboard-main">
          <Routes>
            <Route path="/" element={<Dashboard shopData={shopData} />} />
            <Route path="/products" element={<Products shopData={shopData} />} />
            <Route path="/products/add" element={<ProductForm shop={shopData} />} />
            <Route path="/products/edit/:productId" element={<ProductForm shop={shopData} />} />
            {/* تم إزالة مسارات الطلبات */}
            <Route path="/settings" element={<ShopSettings shopData={shopData} setShopData={setShopData} />} />
            <Route path="/analytics" element={<Analytics shopData={shopData} />} />
            <Route path="/specifications" element={<Specifications shopData={shopData} />} />
            <Route path="/brands" element={<Brands shopData={shopData} />} />
            <Route path="/notifications" element={<Notifications ownerData={ownerData} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
