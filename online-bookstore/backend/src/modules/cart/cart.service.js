const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

const getCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true, brand: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: { include: { category: true, brand: true } } } } },
    });
  }
  return cart;
};

const addItem = async (userId, productId, quantity) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
  if (product.stockQuantity < quantity) throw createError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');

  const cart = await prisma.cart.findUnique({ where: { userId } });

  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, unitPrice: product.price },
    });
  }

  return getCart(userId);
};

const updateItem = async (userId, itemId, quantity) => {
  if (quantity <= 0) return removeItem(userId, itemId);

  const cart = await prisma.cart.findUnique({ where: { userId } });
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw createError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getCart(userId);
};

const removeItem = async (userId, itemId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw createError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
