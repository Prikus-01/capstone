import api from '../../lib/api';

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist').then(r => r.data),
  addItem: (productId) => api.post('/wishlist/items', { productId }).then(r => r.data),
  removeItem: (productId) => api.delete(`/wishlist/items/${productId}`).then(r => r.data),
};
