const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const cartService = require('./cart.service');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
});

router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cart = await cartService.addItem(req.user.id, productId, Number(quantity));
    res.status(201).json({ success: true, data: { cart } });
  } catch (err) { next(err); }
});

router.patch('/items/:id', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.user.id, req.params.id, Number(quantity));
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
});

router.delete('/items/:id', async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.id);
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
});

router.delete('/', async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    res.json({ success: true, data: { message: 'Cart cleared' } });
  } catch (err) { next(err); }
});

module.exports = router;
