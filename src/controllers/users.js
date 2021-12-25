const { users } = require('../../models');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
	const input = req.body;

	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
	});

	const { error, value } = schema.validate(input);

	if (error) {
		return res.status(400).send({
			status: 'failed',
			message: error,
		});
	}

	try {
		const userExist = await users.findOne({
			where: {
				email: value.email,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});

		if (!userExist) {
			return res.status(404).send({
				status: 'failed',
				message: 'user not exist',
			});
		}

		const isValid = await bcrypt.compare(input.password, userExist.password);
		console.log(isValid);
		if (!isValid) {
			return res.status(401).send({
				status: 'failed',
				message: 'password is not correct',
			});
		}

		const token = jwt.sign({ id: userExist.id }, process.env.SECRET_KEY);

		res.status(200).send({
			status: 'success',
			data: {
				user: {
					fullName: userExist.fullName,
					email: userExist.email,
					token,
				},
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			status: 'failed',
			message: 'Server Error',
		});
	}
};
