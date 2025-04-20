import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_URL}/auth`;

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { email, password });
      console.log('Login response:', response.data);

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // التحقق من بيانات المستخدم
        console.log('Stored user data:', JSON.parse(localStorage.getItem('user')));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      });

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        return response.data.access;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // إزالة بيانات المستخدم في حالة فشل تحديث التوكن
      authService.logout();
      throw error;
    }
  },

  isOwner: () => {
    const userData = authService.getCurrentUser();
    console.log('Current user data:', userData);

    // التحقق من هيكل البيانات المختلفة
    if (!userData) return false;

    // التحقق من وجود حقل user_type مباشرة
    if (userData.user_type === 'owner') {
      console.log('User is owner (user_type field)');
      return true;
    }

    // التحقق من وجود حقل user مع حقل user_type
    if (userData.user && userData.user.user_type === 'owner') {
      console.log('User is owner (user.user_type field)');
      return true;
    }

    // التحقق من وجود حقل role
    if (userData.role === 'owner') {
      console.log('User is owner (role field)');
      return true;
    }

    // التحقق من وجود حقل user مع حقل role
    if (userData.user && userData.user.role === 'owner') {
      console.log('User is owner (user.role field)');
      return true;
    }

    console.log('User is not owner');
    return false;
  },

  isAdmin: () => {
    const userData = authService.getCurrentUser();
    if (!userData) return false;

    // التحقق من هياكل البيانات المختلفة
    return (
      userData.user_type === 'admin' ||
      (userData.user && userData.user.user_type === 'admin') ||
      userData.role === 'admin' ||
      (userData.user && userData.user.role === 'admin')
    );
  },

  isCustomer: () => {
    const userData = authService.getCurrentUser();
    if (!userData) return false;

    // التحقق من هياكل البيانات المختلفة
    return (
      userData.user_type === 'customer' ||
      (userData.user && userData.user.user_type === 'customer') ||
      userData.role === 'customer' ||
      (userData.user && userData.user.role === 'customer')
    );
  }
};

export default authService;
