const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

const productInclude = { include: { category: true, brand: true } };

const getOrCreateWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: { items: { include: { product: productInclude }, orderBy: { createdAt: 'desc' } } },
  });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: { items: { include: { product: productInclude } } },
    });
  }
  return wishlist;
};

const getWishlist = async (userId) => getOrCreateWishlist(userId);

const addItem = async (userId, productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError(404, 'Product not found', 'PRODUCT_NOT_FOUND');

  const wishlist = await getOrCreateWishlist(userId);

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
  if (existing) throw createError(409, 'Product already in wishlist', 'ALREADY_IN_WISHLIST');

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  return getOrCreateWishlist(userId);
};

const removeItem = async (userId, productId) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) throw createError(404, 'Wishlist not found', 'WISHLIST_NOT_FOUND');

  const item = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
  if (!item) throw createError(404, 'Item not in wishlist', 'ITEM_NOT_FOUND');

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  return getOrCreateWishlist(userId);
};

module.exports = { getWishlist, addItem, removeItem };
