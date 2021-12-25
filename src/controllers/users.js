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
			message: error.details[0].message,
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

		const isValid = value.password === userExist.password;

		const token = jwt.sign({ id: userExist.id }, process.env.SECRET_KEY);

		if (!isValid) {
			return res.status(401).send({
				status: 'failed',
				message: 'password is not correct',
			});
		}
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

exports.register = async (req, res) => {
	const input = req.body;

	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
		fullName: joi.string().min(3).required(),
	});

	const { error, value } = schema.validate(input);

	if (error) {
		return res.status(400).send({
			status: 'failed',
			message: error.details[0].message,
		});
	}

	try {
		const userExist = await users.findAll({
			where: {
				email: input.email,
			},
		});
		if (userExist.length > 0) {
			return res.status(409).send({
				status: 'failed',
				message: 'user email already exist',
			});
		}

		const salt = await bcrypt.genSalt(8);

		const hashedPassword = await bcrypt.hash(input.password, salt);

		const newUser = await users.create({
			email: input.email,
			password: hashedPassword,
			fullName: input.fullName,
		});

		const token = jwt.sign({ id: newUser.dataValues.id }, process.env.SECRET_KEY);

		res.status(200).send({
			status: 'success...',
			data: {
				user: {
					fullName: input.fullName,
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
