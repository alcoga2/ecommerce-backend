const bcrypt = require('bcrypt');
const User = require('../models/User');
const { parseListQuery } = require('../utils/listQuery');

const USER_FIELDS = ['name', 'email', 'password'];
const pickUserFields = (data, { rejectUnknown = false } = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    const error = new Error('El cuerpo de la solicitud debe ser un objeto JSON');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }
  const unknownFields = Object.keys(data).filter((field) => !USER_FIELDS.includes(field));
  if (rejectUnknown && unknownFields.length) {
    const error = new Error('La solicitud contiene campos no permitidos');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    error.details = unknownFields.map((field) => ({ field, message: 'Campo no permitido' }));
    throw error;
  }
  return Object.fromEntries(
    USER_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(data, field))
      .map((field) => [field, data[field]])
  );
};

const prepareUserData = async (data) => {
  const fields = pickUserFields(data);
  if (Object.prototype.hasOwnProperty.call(fields, 'name') && typeof fields.name === 'string') {
    fields.name = fields.name.trim();
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'email') && typeof fields.email === 'string') {
    fields.email = fields.email.trim().toLowerCase();
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'password')) {
    if (typeof fields.password !== 'string' || fields.password.length < 12) {
      const error = new Error('La contraseña debe tener al menos 12 caracteres');
      error.statusCode = 422;
      error.code = 'VALIDATION_ERROR';
      error.details = [{ field: 'password', message: error.message }];
      throw error;
    }
    fields.passwordHash = await bcrypt.hash(fields.password, 12);
    delete fields.password;
  }
  return fields;
};

const createUser = async (data) => {
  const fields = await prepareUserData(pickUserFields(data, { rejectUnknown: true }));
  return User.create({ name: fields.name, email: fields.email, passwordHash: fields.passwordHash });
};

const getAllUsers = async (query = {}) => {
  const options = parseListQuery(query, ['name', 'email', 'createdAt']);
  const [data, total] = await Promise.all([
    User.find(options.filter).sort(options.sort).skip(options.skip).limit(options.limit),
    User.countDocuments(options.filter),
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
const getUserById = async (id) => User.findById(id);

const updateUser = async (id, data) => {
  const fields = await prepareUserData(pickUserFields(data, { rejectUnknown: true }));
  const updates = {};
  for (const field of ['name', 'email', 'passwordHash']) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) updates[field] = fields[field];
  }
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

const deactivateUser = async (id) => User.findByIdAndUpdate(
  id,
  { active: false },
  { new: true, runValidators: true }
);

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser };
