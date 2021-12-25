require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const router = require('./src/routes/index');

app.use(express.json());
app.use('/api/v1/', router);
app.use((req, res) => {
	res.status(404).send({
		status: 'failed',
		message: '404 : Request not found',
	});
});

app.listen(port, () => {
	console.log('listen to port ', port);
});
