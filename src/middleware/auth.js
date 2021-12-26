const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
	const authHeader = req.header('Authorization');
	const token = authHeader.split(' ')[1];
	if (!authHeader || !token) {
		return res.status(401).send({
			status: 'failed',
			message: 'access denied',
		});
	}
	try {
		const isVerified = jwt.verify(token, process.env.SECRET_KEY);
		req.user = isVerified;
		next();
	} catch (error) {
		return res.status(400).send({
			status: 'failed',
			message: 'invalid token',
		});
	}
};
