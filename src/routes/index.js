const express = require('express');
const router = express.Router();
const { login, register, getUsers, deleteUser } = require('../controllers/users');
const {
	getFunds,
	getFund,
	addFund,
	updateFund,
	deleteFund,
	addDonate,
	getDonate,
	getDonates,
	updateDonate,
} = require('../controllers/donations');

const { auth } = require('../middleware/auth');
const { uploads } = require('../middleware/uploads');

router.post('/login', login);
router.post('/register', register);
router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);
router.get('/funds', getFunds);
router.get('/fund/:id', getFund);
router.post('/fund', auth, uploads('thumbnail'), addFund);
router.patch('/fund/:id', auth, updateFund);
router.delete('/fund/:id', deleteFund);

router.get('/donates', getDonates);
router.get('/donate/:id', getDonate);
router.post('/donate/:id', auth, uploads('proofattachment'), addDonate);
router.delete('/donate/:id', deleteFund);

router.patch('/fund/:idFund/:idDonate', auth, updateDonate);

module.exports = router;
