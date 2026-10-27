const categoryService = require('../services/categoryService');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      const error = new Error('Categoria no encontrada'); error.statusCode = 404; return next(error);
    }
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    if (!category) {
      const error = new Error('Categoria no encontrada'); error.statusCode = 404; return next(error);
    }
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) {
      const error = new Error('Categoria no encontrada'); error.statusCode = 404; return next(error);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
