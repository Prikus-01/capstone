const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const prisma = require('../../config/database');
const { createError } = require('../../middleware/error.middleware');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
    res.json({ success: true, data: { addresses } });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { label, recipientName, phone, line1, line2, city, state, postalCode, country = 'India', isDefault = false } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.user.id, label: label || 'HOME', recipientName, phone, line1, line2, city, state, postalCode, country, isDefault },
    });
    res.status(201).json({ success: true, data: { address } });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) throw createError(404, 'Address not found', 'NOT_FOUND');
    const { label, recipientName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const updated = await prisma.address.update({ where: { id: req.params.id }, data: { label, recipientName, phone, line1, line2, city, state, postalCode, country, isDefault } });
    res.json({ success: true, data: { address: updated } });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) throw createError(404, 'Address not found', 'NOT_FOUND');
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Address deleted' } });
  } catch (err) { next(err); }
});

module.exports = router;
