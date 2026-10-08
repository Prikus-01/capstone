import api from '../../lib/api';

export const ordersApi = {
  getOrders: (params) => api.get('/orders', { params }).then(r => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then(r => r.data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`).then(r => r.data),
  buyAgain: (id) => api.post(`/orders/${id}/buy-again`).then(r => r.data),
};
