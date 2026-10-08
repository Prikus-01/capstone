import api from '../../lib/api';

export const productsApi = {
  getProducts: (params) => api.get('/products', { params }).then(r => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then(r => r.data),
  getCategories: () => api.get('/categories').then(r => r.data),
  getCategoryProducts: (slug, params) => api.get(`/categories/${slug}/products`, { params }).then(r => r.data),
  getBrands: () => api.get('/brands').then(r => r.data),
  getBrandProducts: (slug, params) => api.get(`/brands/${slug}/products`, { params }).then(r => r.data),
  getFeatured: () => api.get('/recommendations/featured').then(r => r.data),
  getRecommendations: () => api.get('/recommendations').then(r => r.data),
};
