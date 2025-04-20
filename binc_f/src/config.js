// تكوين التطبيق

// إنشاء كائن التكوين
const config = {
  // عنوان API
  API_URL: 'http://localhost:8000/api',

  // إعدادات الصفحات
  PAGINATION: {
    itemsPerPage: 10,
    maxPagesShown: 5
  },

  // إعدادات الصور
  IMAGES: {
    defaultProductImage: 'https://via.placeholder.com/300x200?text=No+Image',
    defaultUserAvatar: 'https://via.placeholder.com/150?text=User'
  },
 
  // إعدادات الأوقات
  TIMES: {
    tokenRefreshInterval: 15 * 60 * 1000, // 15 دقيقة بالملي ثانية
    sessionTimeout: 60 * 60 * 1000 // ساعة واحدة بالملي ثانية
  },

  // إعدادات الرسائل
  MESSAGES: {
    errors: {
      general: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      network: 'خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
      auth: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
      notFound: 'لم يتم العثور على العنصر المطلوب.',
      validation: 'يرجى التحقق من البيانات المدخلة.'
    },
    success: {
      save: 'تم الحفظ بنجاح.',
      update: 'تم التحديث بنجاح.',
      delete: 'تم الحذف بنجاح.'
    }
  },

  // إعدادات المصادقة
  AUTH: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data'
  }
};

export default config;
