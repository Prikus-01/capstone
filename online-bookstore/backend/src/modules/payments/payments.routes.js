const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const { confirmPayment } = require('../checkout/checkout.service');

router.use(authMiddleware);

// Mock payment confirmation endpoint
router.post('/:orderId/confirm', async (req, res, next) => {
  try {
    const { success = true } = req.body;
    const order = await confirmPayment(req.params.orderId, Boolean(success));
    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
});

module.exports = router;
