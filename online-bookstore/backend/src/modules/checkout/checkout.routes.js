const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const checkoutService = require('./checkout.service');

router.use(authMiddleware);

// Preview order before confirming
router.post('/preview', async (req, res, next) => {
  try {
    const { addressId, giftPointsToUse = 0 } = req.body;
    const preview = await checkoutService.previewOrder(req.user.id, addressId, Number(giftPointsToUse));
    res.json({ success: true, data: preview });
  } catch (err) { next(err); }
});

// Create order (PENDING)
router.post('/order', async (req, res, next) => {
  try {
    const { addressId, giftPointsToUse = 0, paymentMethod = 'MOCK' } = req.body;
    const order = await checkoutService.createOrder(req.user.id, addressId, Number(giftPointsToUse), paymentMethod);
    res.status(201).json({ success: true, data: { order } });
  } catch (err) { next(err); }
});

module.exports = router;
