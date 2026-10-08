const express = require('express');
const router = express.Router();
const prisma = require('../../config/database');

router.get('/', async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: { brands } });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug } });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: { brand } });
  } catch (err) { next(err); }
});

router.get('/:slug/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sort } = req.query;
    const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug } });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found', code: 'NOT_FOUND' });

    let orderBy = [{ createdAt: 'desc' }];
    if (sort === 'price_asc') orderBy = [{ price: 'asc' }];
    else if (sort === 'price_desc') orderBy = [{ price: 'desc' }];
    else if (sort === 'rating') orderBy = [{ rating: 'desc' }];

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where: { brandId: brand.id }, orderBy, skip, take: Number(limit), include: { category: true, brand: true } }),
      prisma.product.count({ where: { brandId: brand.id } }),
    ]);
    res.json({ success: true, data: { products, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } } });
  } catch (err) { next(err); }
});

module.exports = router;
