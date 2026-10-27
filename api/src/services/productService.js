const Product = require('../models/Producte');
const createProduct = async (productData) => {
const newProduct = new Product(productData);

return await newProduct.save();
};

const getAllProducts = async () => {
  return await Product.find().populate('category');
};

const getProductById = async (id) => {
  return await Product.findById(id).populate('category');
};

const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  }).populate('category');
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
