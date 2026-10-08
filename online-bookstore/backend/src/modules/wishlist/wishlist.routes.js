const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const wishlistService = require('./wishlist.service');

// GET /api/wishlist — fetch current user's wishlist
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.json({ success: true, data: { wishlist } });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/items — add a product
router.post('/items', authMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
    const wishlist = await wishlistService.addItem(req.user.id, productId);
    res.status(201).json({ success: true, data: { wishlist } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/items/:productId — remove a product
router.delete('/items/:productId', authMiddleware, async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeItem(req.user.id, req.params.productId);
    res.json({ success: true, data: { wishlist } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
