const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

const getProducts = async ({ category, brand, search, sort, page, limit, minPrice, maxPrice, format }) => {
  const where = {};

  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
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
  else if (sort === 'title') orderBy = [{ title: 'asc' }];

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      include: { category: true, brand: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
  if (!product) throw createError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
  return product;
};

module.exports = { getProducts, getProduct };
