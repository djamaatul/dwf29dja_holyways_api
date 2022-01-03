const express = require('express');
const router = express.Router();
const { login, register, getUsers, deleteUser, getUser, userDonates } = require('../controllers/users');
const {
	getFunds,
	getFundsUser,
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
const { checkAuth } = require('../controllers/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/users', auth, getUsers);
router.get('/user', auth, getUser);
// router.delete('/user/:id', deleteUser);
router.get('/check-auth', checkAuth);

router.get('/funds', getFunds);
router.get('/fundsUser', auth, getFundsUser);
router.get('/fund/:id', getFund);
router.post('/fund', auth, uploads('thumbnail', 'funds'), addFund);
router.patch('/fund/:id', auth, uploads('thumbnail', 'funds'), updateFund);
router.delete('/fund/:id', auth, deleteFund);

router.get('/donates', getDonates);
router.get('/userDonates', auth, userDonates);
router.get('/donate/:id', getDonate);
router.post('/donate/:id', auth, uploads('proofattachment', 'invoices'), addDonate);
router.delete('/donate/:id', deleteFund);
router.patch('/donate/:idFund/:idDonate', auth, uploads('proofattachment', 'invoices'), updateDonate);

module.exports = router;
