const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } }, payment: true, address: true },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ success: true, data: { orders, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } } });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        items: { include: { product: { include: { category: true, brand: true } } } },
        payment: true,
        address: true,
      },
    });
    if (!order) throw createError(404, 'Order not found', 'NOT_FOUND');
    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, payment: true },
    });
    if (!order) throw createError(404, 'Order not found', 'NOT_FOUND');

    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) {
      throw createError(400, 'Order cannot be cancelled at this stage', 'CANNOT_CANCEL');
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    if (order.createdAt < fortyEightHoursAgo) {
      throw createError(400, 'Cancellation window (48 hours) has expired', 'CANCELLATION_EXPIRED');
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
      if (order.payment) {
        await tx.payment.update({ where: { orderId: order.id }, data: { status: 'REFUNDED' } });
      }
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
      }
      // Refund gift points if used
      if (order.giftPointsUsed > 0) {
        await tx.user.update({ where: { id: req.user.id }, data: { giftPoints: { increment: order.giftPointsUsed } } });
        await tx.giftPointsTransaction.create({
          data: { userId: req.user.id, orderId: order.id, points: order.giftPointsUsed, reason: 'Refund on cancellation' },
        });
      }
    });

    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, payment: true, address: true } });
    res.json({ success: true, data: { order: updated } });
  } catch (err) { next(err); }
});

// Buy again
router.post('/:id/buy-again', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw createError(404, 'Order not found', 'NOT_FOUND');

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    const unavailable = [];

    for (const item of order.items) {
      if (item.product.stockQuantity <= 0) {
        unavailable.push(item.productTitle);
        continue;
      }
      const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: item.productId } });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
      } else {
        await prisma.cartItem.create({ data: { cartId: cart.id, productId: item.productId, quantity: item.quantity, unitPrice: item.product.price } });
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: { include: { category: true, brand: true } } } } },
    });
    res.json({ success: true, data: { cart: updatedCart, unavailable } });
  } catch (err) { next(err); }
});

module.exports = router;
