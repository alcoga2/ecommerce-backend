const express = require('express');
const userController = require('../controllers/userController');
const localOnly = require('../middleware/localOnly');

const router = express.Router();
router.post('/registro', userController.registerUser);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.use(localOnly);
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deactivateUser);

module.exports = router;
