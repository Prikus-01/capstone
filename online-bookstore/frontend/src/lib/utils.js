/**
 * Format price as Indian rupees
 * @param {number} amount
 */
export const formatPrice = (amount) => `₹${Number(amount).toFixed(0)}`;

/**
 * Format date as "Mon, 21 Jul" style
 * @param {string|Date} date
 */
export const formatDeliveryDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * Calculate discounted price
 */
export const getDiscountedPrice = (price, discountPercent) => {
  return Number(price) * (1 - Number(discountPercent) / 100);
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (order) => {
  const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
  if (!cancellableStatuses.includes(order.status)) return false;
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return new Date(order.createdAt) > fortyEightHoursAgo;
};

/**
 * Truncate string to max length
 */
export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str;

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  const map = {
    PENDING: 'text-yellow-400',
    CONFIRMED: 'text-blue-400',
    PROCESSING: 'text-blue-400',
    SHIPPED: 'text-purple-400',
    DELIVERED: 'text-green-400',
    CANCELLED: 'text-red-400',
  };
  return map[status] || 'text-gray-400';
};
