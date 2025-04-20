import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

// Servicio para gestionar las categorías
const categoryService = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      console.log('Fetching all categories...');
      const response = await axios.get(`${API_URL}/products/categories/`);
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Si hay un error, devolver categorías de ejemplo para evitar errores en la UI
      return [
        { id: 1, name: 'إلكترونيات' },
        { id: 2, name: 'هواتف ذكية' },
        { id: 3, name: 'حواسيب محمولة' },
        { id: 4, name: 'أجهزة لوحية' },
        { id: 5, name: 'سماعات' },
        { id: 6, name: 'كاميرات' },
        { id: 7, name: 'ألعاب فيديو' },
        { id: 8, name: 'أجهزة منزلية' }
      ];
    }
  },

  // Obtener una categoría específica por ID
  getById: async (categoryId) => {
    try {
      console.log(`Fetching category ${categoryId}...`);
      const response = await axios.get(`${API_URL}/categories/${categoryId}/`);
      console.log(`Category ${categoryId} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      throw error;
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId) => {
    try {
      console.log(`Fetching products for category ${categoryId}...`);
      const response = await axios.get(`${API_URL}/categories/${categoryId}/products/`);
      console.log(`Products for category ${categoryId} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      // Si hay un error, devolver un array vacío para evitar errores en la UI
      return [];
    }
  }
};

export default categoryService;
