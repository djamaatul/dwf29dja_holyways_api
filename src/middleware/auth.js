const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
	const authHeader = req.header('Authorization');
	console.log(authHeader);
	if (!authHeader) {
		return res.status(401).send({
			status: 'failed',
			message: 'access denied',
		});
	}
	const token = authHeader.split(' ')[1];
	try {
		const isVerified = jwt.verify(token, '.5Ecr3tk3y!!');
		req.user = isVerified;
		next();
	} catch (error) {
		return res.status(400).send({
			status: 'failed',
			message: 'invalid token',
		});
	}
};
