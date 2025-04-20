import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = `${config.API_URL}/recommendations`;

/**
 * خدمة التوصيات المحسنة باستخدام الذكاء الاصطناعي
 * تقدم واجهة برمجية للتفاعل مع نظام التوصيات في الخادم
 */
const recommendationService = {
  /**
   * الحصول على التوصيات الشخصية للمستخدم
   * @returns {Promise} وعد يحتوي على بيانات التوصيات
   */
  getRecommendations: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  /**
   * الحصول على التوصيات الهجينة المعززة بالذكاء الاصطناعي
   * @returns {Promise} وعد يحتوي على بيانات التوصيات الهجينة
   */
  getHybridRecommendations: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(`${API_URL}/hybrid/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching hybrid recommendations:', error);
      throw error;
    }
  },

  /**
   * تسجيل سلوك المستخدم لتحسين التوصيات
   * @param {string} productId معرف المنتج
   * @param {string} action نوع الإجراء ('view', 'like', 'purchase')
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  trackUserBehavior: async (productId, action) => {
    try {
      const token = authService.getToken();
      if (!token) {
        // إذا لم يكن المستخدم مسجل الدخول، نتجاهل تسجيل السلوك
        console.log('User not authenticated, skipping behavior tracking');
        return null;
      }

      const response = await axios.post(`${API_URL}/track-behavior/`, {
        product_id: productId,
        action: action
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      // نتجاهل الأخطاء هنا لعدم التأثير على تجربة المستخدم
      return null;
    }
  },

  /**
   * تسجيل مشاهدة منتج
   * @param {string} productId معرف المنتج
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  trackProductView: async (productId) => {
    return recommendationService.trackUserBehavior(productId, 'view');
  },

  /**
   * تسجيل إعجاب بمنتج
   * @param {string} productId معرف المنتج
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  trackProductLike: async (productId) => {
    return recommendationService.trackUserBehavior(productId, 'like');
  },

  /**
   * الحصول على المنتجات الشائعة للمستخدمين غير المسجلين
   * @returns {Promise} وعد يحتوي على بيانات المنتجات الشائعة
   */
  getPopularProducts: async () => {
    try {
      const response = await axios.get(`${config.API_URL}/products/popular/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular products:', error);
      return [];
    }
  }
};

export default recommendationService;
