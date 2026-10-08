const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const prisma = require('../../config/database');

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    // Recommend products from categories the user has ordered
    const orderedCategoryIds = await prisma.orderItem.findMany({
      where: { order: { userId: req.user.id } },
      include: { product: { select: { categoryId: true } } },
    });

    const categoryIds = [...new Set(orderedCategoryIds.map(oi => oi.product.categoryId))];

    let products;
    if (categoryIds.length > 0) {
      products = await prisma.product.findMany({
        where: { categoryId: { in: categoryIds } },
        include: { category: true, brand: true },
        orderBy: { rating: 'desc' },
        take: 8,
      });
    } else {
      products = await prisma.product.findMany({
        include: { category: true, brand: true },
        orderBy: { rating: 'desc' },
        take: 8,
      });
    }

    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
});

// Public featured products — returns first 9 books in seed order (they map to the 3 home-page sections)
router.get('/featured', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: 'asc' },
      take: 9,
    });
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
});

module.exports = router;
