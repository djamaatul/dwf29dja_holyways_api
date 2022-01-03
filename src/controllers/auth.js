const jwt = require('jsonwebtoken');
const { users } = require('../../models');

exports.checkAuth = async (req, res) => {
	const authHeader = req.header('Authorization');
	if (!authHeader) {
		return res.status(404).send({
			status: 'failed',
			message: 'token not found',
		});
	}
	const token = authHeader.split(' ')[1];
	try {
		const isVerified = jwt.verify(token, process.env.SECRET_KEY);
		const userExist = await users.findOne({
			where: {
				id: isVerified.id,
			},
			attributes: {
				exclude: ['password', 'createdAt', 'updatedAt'],
			},
		});
		if (!userExist) {
			return res.status(401).send({
				status: 'failed',
				message: 'invalid token',
			});
		}
		res.status(200).send({
			status: 'success',
			data: { ...userExist, token },
		});
	} catch (error) {
		return res.status(401).send({
			status: 'failed',
			message: 'invalid token',
		});
	}
};
