import api from '../../lib/api';

export const cartApi = {
  getCart: () => api.get('/cart').then(r => r.data),
  addItem: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }).then(r => r.data),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }).then(r => r.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then(r => r.data),
  clearCart: () => api.delete('/cart').then(r => r.data),
};
