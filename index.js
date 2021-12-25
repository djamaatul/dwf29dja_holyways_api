require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const router = require('./src/routes/index');

app.use(express.json());
app.use('/api/v1/', router);

app.listen(port, () => {
	console.log('listen to port ', port);
});
