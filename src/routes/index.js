const express = require('express');
const router = express.Router();
const { login, register, getUsers, deleteUser } = require('../controllers/users');

router.post('/login', login);
router.post('/register', register);
router.get('/users', getUsers);
router.get('/user/:id', deleteUser);

module.exports = router;
