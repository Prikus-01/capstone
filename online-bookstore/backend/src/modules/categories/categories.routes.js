const express = require('express');
const router = express.Router();
const prisma = require('../../config/database');

router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: { categories } });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: { category } });
  } catch (err) { next(err); }
});

router.get('/:slug/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sort, format, minPrice, maxPrice, search } = req.query;
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found', code: 'NOT_FOUND' });

    const where = { categoryId: category.id };
    if (format) where.format = { contains: format, mode: 'insensitive' };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ];
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy = [{ createdAt: 'desc' }];
    if (sort === 'price_asc') orderBy = [{ price: 'asc' }];
    else if (sort === 'price_desc') orderBy = [{ price: 'desc' }];
    else if (sort === 'rating') orderBy = [{ rating: 'desc' }];

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: Number(limit), include: { category: true, brand: true } }),
      prisma.product.count({ where }),
    ]);
    res.json({ success: true, data: { products, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } } });
  } catch (err) { next(err); }
});

module.exports = router;
