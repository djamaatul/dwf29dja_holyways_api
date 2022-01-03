const { users, donations } = require('../../models');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function status_failed(message) {
	return { status: 'failed', message };
}

exports.userDonates = async (req, res) => {
	try {
		const dataUser = await donations.findAll({
			where: {
				idUser: req.user.id,
			},
			attributes: {
				exclude: ['proofattachment', 'createdAt'],
			},
		});

		res.status(200).send({
			data: dataUser,
		});
	} catch (error) {
		return res.status(500).send(status_failed(error));
	}
};

exports.getUser = async (req, res) => {
	try {
		const dataUser = await users.findOne({
			where: {
				id: req.user.id,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'password'],
			},
		});
		if (!dataUser) {
			return res.status(404).send({
				status: 'failed',
				message: 'user not found',
			});
		}
		res.status(200).send(dataUser);
	} catch (error) {
		return res.status(500).send(status_failed(error));
	}
};

exports.login = async (req, res) => {
	console.log(req.user);
	const input = req.body;

	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
	});

	const { error, value } = schema.validate(input);

	if (error) {
		return res.status(400).send(status_failed(error.details[0].message));
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
			return res.status(404).send(status_failed('user not found'));
		}
		const isValid = await bcrypt.compare(input.password, userExist.password);

		if (!isValid) {
			return res.status(401).send(status_failed('password is not correct'));
		}

		const token = jwt.sign({ id: userExist.id }, process.env.SECRET_KEY);

		res.status(200).send({
			status: 'success',
			data: {
				id: userExist.id,
				fullName: userExist.fullName,
				email: userExist.email,
				token,
			},
		});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.register = async (req, res) => {
	const input = req.body;

	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
		fullName: joi.string().min(3).required(),
	});

	const { error } = schema.validate(input);

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
			return res.status(400).send({
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
		res.status(500).send(status_failed('server error'));
	}
};

exports.getUsers = async (req, res) => {
	try {
		const dataUser = await users.findAll({
			attributes: {
				exclude: ['password', 'createdAt', 'updatedAt'],
			},
		});
		res.status(200).send({
			status: 'success',
			data: dataUser,
		});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await users.destroy({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).send(status_failed('user is not exist'));
		}
		res.status(200).send({
			status: 'success',
			data: {
				id,
			},
		});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};
