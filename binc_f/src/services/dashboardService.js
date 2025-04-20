import axios from 'axios';
import config from '../config';
import authService from './authService';

const API_URL = `${config.API_URL}/dashboard`;

// Configuración de axios con token de autenticación
const getAuthConfig = () => {
  const token = authService.getToken();
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication token is missing');
  }

  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

// Servicios para la Dashboard
/**
 * Servicio para interactuar con la API del dashboard
 *
 * Notas sobre los endpoints:
 * - Para crear productos:
 *   - Endpoint principal: /api/dashboard/products/ (POST)
 *   - Endpoint alternativo: /api/products/create/ (POST)
 *
 * - Para actualizar productos:
 *   - Endpoint principal: /api/dashboard/products/{id}/ (PUT)
 *   - Endpoint alternativo: /api/products/{id}/update/ (PUT)
 *
 * El servicio intenta primero con el endpoint principal y, si falla,
 * intenta con el endpoint alternativo para garantizar la compatibilidad.
 */
const dashboardService = {
  // Verificar si el usuario está autenticado y es propietario
  checkOwnerAccess: async () => {
    try {
      // Verificar si hay token de autenticación
      if (!authService.isAuthenticated()) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      // Obtener datos del usuario
      const user = authService.getCurrentUser();
      console.log('Current user data in checkOwnerAccess:', user);

      // Verificar si el usuario existe y es propietario
      if (!user) {
        console.error('User data not found');
        throw new Error('User data not found');
      }

      // Verificar el tipo de usuario usando la función isOwner
      if (!authService.isOwner()) {
        console.error('User is not an owner');
        throw new Error('User is not an owner');
      }

      return true;
    } catch (error) {
      console.error('Owner access check failed:', error);
      throw error;
    }
  },

  // Servicios para marcas
  brands: {
    // Obtener todas las marcas
    getAll: async () => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Fetching all brands...');
        const response = await axios.get(`${API_URL}/brands/`, getAuthConfig());
        console.log('Brands response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Si hay un error, devolver un array vacío para evitar errores en la UI
        return [];
      }
    },

    // Obtener una marca específica
    getById: async (brandId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Fetching brand ${brandId}...`);
        const response = await axios.get(`${API_URL}/brands/${brandId}/`, getAuthConfig());
        console.log(`Brand ${brandId} response:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching brand ${brandId}:`, error);
        throw error;
      }
    },

    // Crear una nueva marca
    create: async (brandData) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Creating brand with data:', brandData);
        const response = await axios.post(`${API_URL}/brands/`, brandData, getAuthConfig());
        console.log('Brand created successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating brand:', error);
        throw error;
      }
    },

    // Actualizar una marca existente
    update: async (brandId, brandData) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Updating brand ${brandId} with data:`, brandData);
        const response = await axios.put(`${API_URL}/brands/${brandId}/`, brandData, getAuthConfig());
        console.log('Brand updated successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error updating brand ${brandId}:`, error);
        throw error;
      }
    },

    // Eliminar una marca
    delete: async (brandId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Deleting brand ${brandId}`);
        const response = await axios.delete(`${API_URL}/brands/${brandId}/`, getAuthConfig());
        console.log('Brand deleted successfully');
        return response.data;
      } catch (error) {
        console.error(`Error deleting brand ${brandId}:`, error);
        throw error;
      }
    }
  },

  // Servicios para especificaciones
  specifications: {
    // Obtener todas las categorías de especificaciones
    getCategories: async () => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Fetching specification categories...');
        const response = await axios.get(`${API_URL}/specifications/categories/`, getAuthConfig());
        console.log('Specification categories response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching specification categories:', error);
        // Si hay un error, devolver un array vacío para evitar errores en la UI
        return [];
      }
    },

    // Obtener todas las especificaciones de una categoría
    getByCategory: async (categoryId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Fetching specifications for category ${categoryId}...`);
        const response = await axios.get(`${API_URL}/specifications/categories/${categoryId}/specifications/`, getAuthConfig());
        console.log(`Specifications for category ${categoryId} response:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching specifications for category ${categoryId}:`, error);
        // Si hay un error, devolver un array vacío para evitar errores en la UI
        return [];
      }
    },

    // Obtener todas las especificaciones de un producto
    getProductSpecs: async (productId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Fetching specifications for product ${productId}...`);
        const response = await axios.get(`${API_URL}/products/${productId}/specifications/`, getAuthConfig());
        console.log(`Specifications for product ${productId} response:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching specifications for product ${productId}:`, error);
        // Si hay un error, devolver un array vacío para evitar errores en la UI
        return [];
      }
    },

    // Guardar las especificaciones de un producto
    saveProductSpecs: async (productId, specifications) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Saving specifications for product ${productId}:`, specifications);
        const response = await axios.post(`${API_URL}/products/${productId}/specifications/`, { specifications }, getAuthConfig());
        console.log(`Specifications for product ${productId} saved successfully:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error saving specifications for product ${productId}:`, error);
        throw error;
      }
    }
  },
  // Obtener estadísticas generales
  getStats: async () => {
    try {
      // Verificar acceso
      await dashboardService.checkOwnerAccess();

      console.log('Fetching dashboard stats...');
      const response = await axios.get(`${API_URL}/stats/`, getAuthConfig());
      console.log('Dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Servicios para productos
  products: {
    // Obtener todos los productos
    getAll: async (params = {}) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Fetching all products...');
        const response = await axios.get(`${API_URL}/products/`, {
          ...getAuthConfig(),
          params
        });
        console.log('Products response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },

    // Obtener un producto específico
    getById: async (productId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Fetching product ${productId}...`);
        const response = await axios.get(`${API_URL}/products/${productId}/`, getAuthConfig());
        console.log(`Product ${productId} response:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        throw error;
      }
    },

    // Crear un nuevo producto
    create: async (productData) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Creating product with data:', productData);

        // Preparar los datos del producto
        const data = { ...productData };

        // Asegurarse de que category_id sea un valor válido
        if (!data.category_id) {
          throw new Error('Category ID is required');
        }

        // Asegurarse de que price sea un número válido
        if (isNaN(data.price) || data.price <= 0) {
          throw new Error('Price must be a positive number');
        }

        // Configuración común para las solicitudes
        const requestConfig = {
          ...getAuthConfig(),
          headers: {
            ...getAuthConfig().headers,
            'Content-Type': 'application/json'
          }
        };

        // Si hay un archivo de imagen, usar FormData
        if (productData.image_url instanceof File) {
          const formData = new FormData();
          Object.keys(data).forEach(key => {
            // Para campos JSON como social_media
            if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
              formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
              formData.append(key, data[key]);
            }
          });

          console.log('Sending product data as FormData');
          requestConfig.headers['Content-Type'] = 'multipart/form-data';
          const response = await axios.post(`${API_URL}/products/`, formData, requestConfig);
          console.log('Product created successfully:', response.data);
          return response.data;
        } else {
          // Si no hay archivo, enviar como JSON
          console.log('Sending product data as JSON');

          // Usar la URL correcta del dashboard (primera opción)
          try {
            console.log('Using dashboard endpoint: /api/dashboard/products/');
            const response = await axios.post(`${API_URL}/products/`, data, requestConfig);
            console.log('Product created successfully (dashboard endpoint):', response.data);
            return response.data;
          } catch (dashboardError) {
            console.log('Dashboard endpoint failed:', dashboardError);
            console.log('Response status:', dashboardError.response?.status);
            console.log('Response data:', dashboardError.response?.data);

            // Si el error es de autorización o no encontrado, no intentar con otra URL
            if (dashboardError.response &&
                (dashboardError.response.status === 401 ||
                 dashboardError.response.status === 403 ||
                 dashboardError.response.status === 404)) {
              throw dashboardError;
            }

            // Si falla por otra razón, intentar con la URL de productos
            console.log('Trying products endpoint: /api/products/create/');
            try {
              const response = await axios.post(`${config.API_URL}/products/create/`, data, requestConfig);
              console.log('Product created successfully (products endpoint):', response.data);
              return response.data;
            } catch (productsError) {
              console.error('Products endpoint also failed:', productsError);
              console.log('Response status:', productsError.response?.status);
              console.log('Response data:', productsError.response?.data);
              throw productsError;
            }
          }
        }
      } catch (error) {
        console.error('Error creating product:', error);

        // Mejorar el mensaje de error
        if (error.response && error.response.data) {
          console.log('Server error response:', error.response.data);
          // Propagar el error del servidor con detalles
          if (typeof error.response.data === 'object') {
            // Si la respuesta es un objeto, buscar mensajes de error
            const errorMessages = [];
            Object.entries(error.response.data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                errorMessages.push(`${key}: ${value}`);
              }
            });

            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join('\n'));
            }
          }
          throw error;
        } else if (error.message) {
          // Propagar el error local
          throw error;
        } else {
          // Error genérico
          throw new Error('Failed to create product. Please try again.');
        }
      }
    },

    // Actualizar un producto existente
    update: async (productId, productData) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Updating product ${productId} with data:`, productData);

        // Preparar los datos del producto
        const data = { ...productData };

        // Asegurarse de que category_id sea un valor válido
        if (!data.category_id) {
          throw new Error('Category ID is required');
        }

        // Asegurarse de que price sea un número válido
        if (isNaN(data.price) || data.price <= 0) {
          throw new Error('Price must be a positive number');
        }

        // Configuración común para las solicitudes
        const requestConfig = {
          ...getAuthConfig(),
          headers: {
            ...getAuthConfig().headers,
            'Content-Type': 'application/json'
          }
        };

        // Si hay un archivo de imagen, usar FormData
        if (productData.image_url instanceof File) {
          const formData = new FormData();
          Object.keys(data).forEach(key => {
            // Para campos JSON como social_media
            if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
              formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
              formData.append(key, data[key]);
            }
          });

          console.log('Sending product data as FormData');
          requestConfig.headers['Content-Type'] = 'multipart/form-data';
          const response = await axios.put(`${API_URL}/products/${productId}/`, formData, requestConfig);
          console.log('Product updated successfully:', response.data);
          return response.data;
        } else {
          // Si no hay archivo, enviar como JSON
          console.log('Sending product data as JSON');

          // Usar la URL correcta del dashboard (primera opción)
          try {
            console.log(`Using dashboard endpoint: /api/dashboard/products/${productId}/`);
            const response = await axios.put(`${API_URL}/products/${productId}/`, data, requestConfig);
            console.log('Product updated successfully (dashboard endpoint):', response.data);
            return response.data;
          } catch (dashboardError) {
            console.log('Dashboard endpoint failed:', dashboardError);
            console.log('Response status:', dashboardError.response?.status);
            console.log('Response data:', dashboardError.response?.data);

            // Si el error es de autorización o no encontrado, no intentar con otra URL
            if (dashboardError.response &&
                (dashboardError.response.status === 401 ||
                 dashboardError.response.status === 403 ||
                 dashboardError.response.status === 404)) {
              throw dashboardError;
            }

            // Si falla por otra razón, intentar con la URL de productos
            console.log(`Trying products endpoint: /api/products/${productId}/update/`);
            try {
              const response = await axios.put(`${config.API_URL}/products/${productId}/update/`, data, requestConfig);
              console.log('Product updated successfully (products endpoint):', response.data);
              return response.data;
            } catch (productsError) {
              console.error('Products endpoint also failed:', productsError);
              console.log('Response status:', productsError.response?.status);
              console.log('Response data:', productsError.response?.data);
              throw productsError;
            }
          }
        }
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);

        // Mejorar el mensaje de error
        if (error.response && error.response.data) {
          console.log('Server error response:', error.response.data);
          // Propagar el error del servidor con detalles
          if (typeof error.response.data === 'object') {
            // Si la respuesta es un objeto, buscar mensajes de error
            const errorMessages = [];
            Object.entries(error.response.data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                errorMessages.push(`${key}: ${value}`);
              }
            });

            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join('\n'));
            }
          }
          throw error;
        } else if (error.message) {
          // Propagar el error local
          throw error;
        } else {
          // Error genérico
          throw new Error(`Failed to update product ${productId}. Please try again.`);
        }
      }
    },

    // Eliminar un producto
    delete: async (productId) => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log(`Deleting product ${productId}`);
        const response = await axios.delete(`${API_URL}/products/${productId}/`, getAuthConfig());
        console.log('Product deleted successfully');
        return response.data;
      } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        throw error;
      }
    }
  },

  // Servicios para pedidos
  orders: {
    // Obtener todos los pedidos
    getAll: async (params = {}) => {
      try {
        const response = await axios.get(`${API_URL}/orders/`, {
          ...getAuthConfig(),
          params
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },

    // Obtener un pedido específico
    getById: async (orderId) => {
      try {
        const response = await axios.get(`${API_URL}/orders/${orderId}/`, getAuthConfig());
        return response.data;
      } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw error;
      }
    },

    // Actualizar el estado de un pedido
    updateStatus: async (orderId, status) => {
      try {
        const response = await axios.put(`${API_URL}/orders/${orderId}/`, { status }, getAuthConfig());
        return response.data;
      } catch (error) {
        console.error(`Error updating order ${orderId} status:`, error);
        throw error;
      }
    }
  },

  // Servicios para análisis
  analytics: {
    // Obtener datos de análisis
    getData: async (timeRange = 'month') => {
      try {
        const response = await axios.get(`${API_URL}/analytics/`, {
          ...getAuthConfig(),
          params: { time_range: timeRange }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
      }
    }
  },

  // Servicios para la tienda
  shop: {
    // Obtener detalles de la tienda
    getDetails: async () => {
      try {
        // Verificar acceso
        await dashboardService.checkOwnerAccess();

        console.log('Fetching shop details...');
        const response = await axios.get(`${config.API_URL}/shop/check/`, getAuthConfig());
        console.log('Shop details response:', response.data);

        if (response.data && response.data.shop) {
          return response.data.shop;
        } else {
          throw new Error('No shop data found');
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
        throw error;
      }
    }
  },

  // Servicios para configuración de la tienda
  shopSettings: {
    // Obtener configuración de la tienda
    get: async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/`, getAuthConfig());
        return response.data;
      } catch (error) {
        console.error('Error fetching shop settings:', error);
        throw error;
      }
    },

    // Actualizar configuración de la tienda
    update: async (settingsData) => {
      try {
        // Si hay archivos (logo o banner), usar FormData
        if (settingsData.logo instanceof File || settingsData.banner instanceof File) {
          const formData = new FormData();
          Object.keys(settingsData).forEach(key => {
            // Para campos JSON como social_media
            if (key === 'social_media' && typeof settingsData[key] === 'object') {
              formData.append(key, JSON.stringify(settingsData[key]));
            } else {
              formData.append(key, settingsData[key]);
            }
          });

          const response = await axios.put(`${API_URL}/settings/`, formData, {
            ...getAuthConfig(),
            headers: {
              ...getAuthConfig().headers,
              'Content-Type': 'multipart/form-data'
            }
          });
          return response.data;
        } else {
          // Si no hay archivos, enviar como JSON
          const response = await axios.put(`${API_URL}/settings/`, settingsData, getAuthConfig());
          return response.data;
        }
      } catch (error) {
        console.error('Error updating shop settings:', error);
        throw error;
      }
    }
  }
};

export default dashboardService;
