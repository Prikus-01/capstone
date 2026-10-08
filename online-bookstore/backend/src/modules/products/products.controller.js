const productsService = require('./products.service');

const getProducts = async (req, res, next) => {
  try {
    const { category, brand, search, sort, page = 1, limit = 12, minPrice, maxPrice, format } = req.query;
    const result = await productsService.getProducts({ category, brand, search, sort, page: Number(page), limit: Number(limit), minPrice, maxPrice, format });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productsService.getProduct(req.params.id);
    res.json({ success: true, data: { product } });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct };
