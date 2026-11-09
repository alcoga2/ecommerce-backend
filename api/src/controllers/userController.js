const userService = require('../services/userService');

const registerUser = async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (error) { next(error); }
};

// Alias para conservar el endpoint CRUD existente POST /api/users.
const createUser = registerUser;

const loginUser = async (req, res, next) => {
  try {
    const { user, token } = await userService.loginUser(req.body);
    res.status(200).json({ status: 'success', data: { user, token } });
  } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
  try {
    res.status(200).json(await userService.getAllUsers(req.query));
  } catch (error) { next(error); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) { const error = new Error('Usuario no encontrado'); error.statusCode = 404; return next(error); }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) { const error = new Error('Usuario no encontrado'); error.statusCode = 404; return next(error); }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) { next(error); }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id);
    if (!user) { const error = new Error('Usuario no encontrado'); error.statusCode = 404; return next(error); }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) { next(error); }
};

module.exports = { createUser, registerUser, loginUser, getAllUsers, getUserById, updateUser, deactivateUser };
