require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

app.get('/', (req, res, next) => {
	res.send('server siap');
});

app.listen(port, () => {
	console.log('listen to port ', port);
});
