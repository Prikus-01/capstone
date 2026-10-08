const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

const POINTS_TO_RUPEE_RATIO = 0.1; // 10 points = ₹1
const MAX_POINTS_PERCENT = 0.2;     // Max 20% of subtotal can be paid by points
const SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49;
const POINTS_EARNED_PERCENT = 0.05; // 5% of total as points

const previewOrder = async (userId, addressId, giftPointsToUse) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw createError(400, 'Cart is empty', 'EMPTY_CART');

  const address = addressId ? await prisma.address.findFirst({ where: { id: addressId, userId } }) : null;

  const subtotal = cart.items.reduce((sum, item) => {
    const discounted = Number(item.product.price) * (1 - Number(item.product.discountPercent) / 100);
    return sum + discounted * item.quantity;
  }, 0);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const maxPointsValue = subtotal * MAX_POINTS_PERCENT;
  const pointsValue = Math.min(giftPointsToUse * POINTS_TO_RUPEE_RATIO, maxPointsValue, user.giftPoints * POINTS_TO_RUPEE_RATIO);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - pointsValue + shipping);

  return { subtotal: Math.round(subtotal * 100) / 100, pointsValue: Math.round(pointsValue * 100) / 100, shipping, total: Math.round(total * 100) / 100, availablePoints: user.giftPoints };
};

const createOrder = async (userId, addressId, giftPointsToUse, paymentMethod) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw createError(400, 'Cart is empty', 'EMPTY_CART');

  // Resolve address — if no addressId supplied, use default or auto-create a placeholder
  let resolvedAddressId = addressId;
  if (!resolvedAddressId) {
    const existing = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) {
      resolvedAddressId = existing.id;
    } else {
      // Create a placeholder address so the order can proceed
      const placeholder = await prisma.address.create({
        data: {
          userId,
          recipientName: 'Guest',
          phone: '0000000000',
          line1: 'Address not provided',
          city: 'N/A',
          state: 'N/A',
          postalCode: '000000',
          country: 'India',
          label: 'HOME',
        },
      });
      resolvedAddressId = placeholder.id;
    }
  } else {
    const address = await prisma.address.findFirst({ where: { id: resolvedAddressId, userId } });
    if (!address) throw createError(404, 'Address not found', 'NOT_FOUND');
  }

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stockQuantity < item.quantity) {
      throw createError(400, `Insufficient stock for ${item.product.title}`, 'INSUFFICIENT_STOCK');
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const subtotal = cart.items.reduce((sum, item) => {
    const discounted = Number(item.product.price) * (1 - Number(item.product.discountPercent) / 100);
    return sum + discounted * item.quantity;
  }, 0);

  const maxPointsValue = subtotal * MAX_POINTS_PERCENT;
  const pointsValue = Math.min(giftPointsToUse * POINTS_TO_RUPEE_RATIO, maxPointsValue, user.giftPoints * POINTS_TO_RUPEE_RATIO);
  const actualPointsUsed = Math.round(pointsValue / POINTS_TO_RUPEE_RATIO);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = Math.max(0, subtotal - pointsValue + shipping);

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId: resolvedAddressId,
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(pointsValue * 100) / 100,
        giftPointsUsed: actualPointsUsed,
        shippingAmount: shipping,
        totalAmount: Math.round(totalAmount * 100) / 100,
        items: {
          create: cart.items.map(item => {
            const discounted = Number(item.product.price) * (1 - Number(item.product.discountPercent) / 100);
            return {
              productId: item.productId,
              productTitle: item.product.title,
              quantity: item.quantity,
              unitPrice: Math.round(discounted * 100) / 100,
              lineTotal: Math.round(discounted * item.quantity * 100) / 100,
            };
          }),
        },
        payment: {
          create: {
            method: paymentMethod,
            amount: Math.round(totalAmount * 100) / 100,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
      },
    });

    // Deduct gift points
    if (actualPointsUsed > 0) {
      await tx.user.update({ where: { id: userId }, data: { giftPoints: { decrement: actualPointsUsed } } });
      await tx.giftPointsTransaction.create({
        data: { userId, orderId: newOrder.id, points: -actualPointsUsed, reason: 'Redeemed for order' },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
};

const confirmPayment = async (orderId, success) => {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) throw createError(404, 'Order not found', 'NOT_FOUND');

  if (success) {
    const pointsEarned = Math.floor(Number(order.totalAmount) * POINTS_EARNED_PERCENT * 10);
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { orderId }, data: { status: 'SUCCESS', transactionReference: `TXN-${Date.now()}` } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
      await tx.user.update({ where: { id: order.userId }, data: { giftPoints: { increment: pointsEarned } } });
      if (pointsEarned > 0) {
        await tx.giftPointsTransaction.create({
          data: { userId: order.userId, orderId, points: pointsEarned, reason: 'Earned from order' },
        });
      }
    });
  } else {
    // Restore stock on payment failure
    const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
      for (const item of orderItems) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
      }
    });
  }

  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true, address: true } });
};

module.exports = { previewOrder, createOrder, confirmPayment };
