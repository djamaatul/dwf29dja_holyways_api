require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const router = require('./src/routes/index');

app.use(express.json());
app.use(cors());

app.use('/api/v1/', router);

app.use('/assets/', express.static('assets'));
app.use('/assets/funds', express.static('assets'));
app.use('/assets/invoices', express.static('assets'));

app.use((req, res) => {
	res.status(404).send({
		status: 'failed',
		message: '404 : Request not found',
	});
});

app.listen(port, () => {
	console.log('listen to port ', port);
});
