const express = require('express');
const router = express.Router();
const { login, register, getUsers, deleteUser } = require('../controllers/users');
const { getFunds, getFund, addFund, updateFund, deleteFund } = require('../controllers/donations');

router.post('/login', login);
router.post('/register', register);
router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);

router.get('/funds', getFunds);
router.get('/fund/:id', getFund);
router.post('/fund', addFund);
router.patch('/fund/:id', updateFund);
router.delete('/fund/:id', deleteFund);

module.exports = router;
