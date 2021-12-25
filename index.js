require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/api/v1/', router);

app.listen(port, () => {
	console.log('listen to port ', port);
});
