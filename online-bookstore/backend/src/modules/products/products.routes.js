const express = require('express');
const router = express.Router();
const { getProducts, getProduct } = require('./products.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

module.exports = router;
