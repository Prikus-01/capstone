import api from '../../lib/api';

export const checkoutApi = {
  previewOrder: (data) => api.post('/checkout/preview', data).then(r => r.data),
  createOrder: (data) => api.post('/checkout/order', data).then(r => r.data),
  confirmPayment: (orderId, success) => api.post(`/payments/${orderId}/confirm`, { success }).then(r => r.data),
  getAddresses: () => api.get('/addresses').then(r => r.data),
  addAddress: (data) => api.post('/addresses', data).then(r => r.data),
};
