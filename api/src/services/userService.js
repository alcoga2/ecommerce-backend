const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { parseListQuery } = require('../utils/listQuery');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('Falta configurar JWT_SECRET');
    error.statusCode = 500;
    error.code = 'INTERNAL_SERVER_ERROR';
    throw error;
  }
  return process.env.JWT_SECRET;
};

const loginUser = async (credentials = {}) => {
  const { email, password } = credentials && typeof credentials === 'object' ? credentials : {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
  if (!user || !passwordMatches || !user.active) {
    const error = new Error('Email o contraseña incorrectos');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = jwt.sign(
    { role: user.role },
    getJwtSecret(),
    { subject: user.id, expiresIn: '1h' }
  );
  return { user, token };
};

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
    // El modelo cifra este valor en su hook pre('save').
    fields.passwordHash = fields.password;
    delete fields.password;
  }
  return fields;
};

const registerUser = async (data) => {
  const fields = await prepareUserData(pickUserFields(data, { rejectUnknown: true }));
  return User.create({ name: fields.name, email: fields.email, passwordHash: fields.passwordHash });
};
// Alias para conservar la operación CRUD existente.
const createUser = registerUser;

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
  const user = await User.findById(id).select('+passwordHash');
  if (!user) return null;
  for (const field of ['name', 'email', 'passwordHash']) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) user[field] = fields[field];
  }
  return user.save();
};

const deactivateUser = async (id) => User.findByIdAndUpdate(
  id,
  { active: false },
  { new: true, runValidators: true }
);

module.exports = { createUser, registerUser, loginUser, getAllUsers, getUserById, updateUser, deactivateUser };
