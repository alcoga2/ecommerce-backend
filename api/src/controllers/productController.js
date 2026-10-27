const productService = require('../services/productService');

const createProduct = async (req, res, next) => {
try {
const product = await productService.createProduct(req.body);

res.status(201).json({ status: 'success', data: product }); }
catch (error) { next(error); }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ status: 'success', data: products });
  } catch (error) { next(error); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      const error = new Error('Producto no encontrado'); error.statusCode = 404; return next(error);
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      const error = new Error('Producto no encontrado'); error.statusCode = 404; return next(error);
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      const error = new Error('Producto no encontrado'); error.statusCode = 404; return next(error);
    }
    res.status(204).end();
  } catch (error) { next(error); }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
