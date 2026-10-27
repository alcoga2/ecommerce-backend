const Category = require('../models/Category');
const { parseListQuery } = require('../utils/listQuery');

const createCategory = async (categoryData) => {
  return Category.create(categoryData);
};

const getAllCategories = async (query = {}) => {
  const options = parseListQuery(query, ['name', 'createdAt']);
  const [data, total] = await Promise.all([
    Category.find(options.filter).sort(options.sort).skip(options.skip).limit(options.limit),
    Category.countDocuments(options.filter),
  ]);
  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
};

const getCategoryById = async (id) => {
  return Category.findById(id);
};

const updateCategory = async (id, categoryData) => {
  return Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  });
};

const deleteCategory = async (id) => {
  return Category.findByIdAndDelete(id);
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
