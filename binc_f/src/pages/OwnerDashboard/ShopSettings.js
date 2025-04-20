import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import './ShopSettings.css';

function ShopSettings({ shopData, setShopData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    url: '',
    logo: '',
    banner: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    }
  });
  
  // حالة معاينة الصور
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  useEffect(() => {
    if (shopData) {
      // تعبئة النموذج ببيانات المتجر الحالية
      setFormData({
        name: shopData.name || '',
        description: shopData.description || '',
        address: shopData.address || '',
        phone: shopData.phone || '',
        email: shopData.email || '',
        url: shopData.url || '',
        logo: shopData.logo || '',
        banner: shopData.banner || '',
        social_media: {
          facebook: shopData.social_media?.facebook || '',
          twitter: shopData.social_media?.twitter || '',
          instagram: shopData.social_media?.instagram || '',
          youtube: shopData.social_media?.youtube || ''
        }
      });
      
      // تعيين معاينة الصور
      setLogoPreview(shopData.logo || '');
      setBannerPreview(shopData.banner || '');
    }
  }, [shopData]);

  // معالجة تغيير حقول النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // معالجة تغيير حقول وسائل التواصل الاجتماعي
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      social_media: {
        ...formData.social_media,
        [name]: value
      }
    });
  };

  // معالجة تغيير الشعار
  const handleLogoChange = (e) => {
    const logoUrl = e.target.value;
    setFormData({
      ...formData,
      logo: logoUrl
    });
    
    if (logoUrl && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))) {
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview('');
    }
  };

  // معالجة تغيير البانر
  const handleBannerChange = (e) => {
    const bannerUrl = e.target.value;
    setFormData({
      ...formData,
      banner: bannerUrl
    });
    
    if (bannerUrl && (bannerUrl.startsWith('http://') || bannerUrl.startsWith('https://'))) {
      setBannerPreview(bannerUrl);
    } else {
      setBannerPreview('');
    }
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // تحديث بيانات المتجر
      const updatedShop = await dashboardService.shop.update(formData);
      
      // تحديث بيانات المتجر في الواجهة
      setShopData(updatedShop);
      
      setSuccess('تم تحديث بيانات المتجر بنجاح');
      setLoading(false);
      
      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating shop settings:', error);
      setError('حدث خطأ أثناء تحديث بيانات المتجر. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="shop-settings-page">
      <div className="shop-settings-header">
        <h1>إعدادات المتجر</h1>
      </div>

      <div className="shop-settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          الإعدادات العامة
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          المظهر
        </button>
        <button 
          className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          وسائل التواصل الاجتماعي
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="shop-settings-form">
        {activeTab === 'general' && (
          <div className="settings-card">
            <h2>الإعدادات العامة</h2>
            
            <div className="form-group">
              <label htmlFor="name">اسم المتجر *</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المتجر"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">وصف المتجر</label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="أدخل وصفًا للمتجر"
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="address">عنوان المتجر *</label>
              <textarea 
                id="address" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل عنوان المتجر"
                rows="2"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="url">رابط المتجر *</label>
              <input 
                type="url" 
                id="url" 
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="أدخل رابط المتجر"
                required
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="settings-card">
            <h2>المظهر</h2>
            
            <div className="form-group">
              <label htmlFor="logo">رابط شعار المتجر</label>
              <input 
                type="url" 
                id="logo" 
                name="logo"
                value={formData.logo}
                onChange={handleLogoChange}
                placeholder="أدخل رابط شعار المتجر"
              />
              
              {logoPreview && (
                <div className="image-preview logo-preview">
                  <img src={logoPreview} alt="معاينة الشعار" />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="banner">رابط بانر المتجر</label>
              <input 
                type="url" 
                id="banner" 
                name="banner"
                value={formData.banner}
                onChange={handleBannerChange}
                placeholder="أدخل رابط بانر المتجر"
              />
              
              {bannerPreview && (
                <div className="image-preview banner-preview">
                  <img src={bannerPreview} alt="معاينة البانر" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="settings-card">
            <h2>وسائل التواصل الاجتماعي</h2>
            
            <div className="form-group">
              <label htmlFor="facebook">
                <i className="fab fa-facebook"></i> فيسبوك
              </label>
              <input 
                type="url" 
                id="facebook" 
                name="facebook"
                value={formData.social_media.facebook}
                onChange={handleSocialMediaChange}
                placeholder="أدخل رابط صفحة الفيسبوك"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="twitter">
                <i className="fab fa-twitter"></i> تويتر
              </label>
              <input 
                type="url" 
                id="twitter" 
                name="twitter"
                value={formData.social_media.twitter}
                onChange={handleSocialMediaChange}
                placeholder="أدخل رابط حساب تويتر"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="instagram">
                <i className="fab fa-instagram"></i> انستغرام
              </label>
              <input 
                type="url" 
                id="instagram" 
                name="instagram"
                value={formData.social_media.instagram}
                onChange={handleSocialMediaChange}
                placeholder="أدخل رابط حساب انستغرام"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="youtube">
                <i className="fab fa-youtube"></i> يوتيوب
              </label>
              <input 
                type="url" 
                id="youtube" 
                name="youtube"
                value={formData.social_media.youtube}
                onChange={handleSocialMediaChange}
                placeholder="أدخل رابط قناة اليوتيوب"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="sr-only">جاري الحفظ...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShopSettings;
