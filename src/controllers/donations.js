const express = require('express');
const { users, funds, donations } = require('../../models');
const joi = require('joi');

function status_failed(message) {
	return { status: 'failed', message };
}

async function getFund(id) {
	const dataFund = await funds.findOne({
		where: {
			id,
		},
		include: {
			model: donations,
			as: 'donations',
			attributes: {
				exclude: ['id', 'createdAt', 'updatedAt', 'idFund', 'idUser'],
			},
			include: {
				model: users,
				as: 'users',
				attributes: {
					exclude: ['password', 'createdAt', 'updatedAt', 'idFund'],
				},
			},
		},

		attributes: {
			exclude: ['createdAt', 'updatedAt', 'idUser'],
		},
	});
	return {
		status: 'success',
		data: {
			funds: {
				id: dataFund.id,
				title: dataFund.title,
				thumbnail: dataFund.thumbnail,
				goal: dataFund.goal,
				description: dataFund.description,
				userDonate: dataFund.donations,
			},
		},
	};
}

exports.getFunds = async (req, res) => {
	try {
		const dataFunds = await funds.findAll({
			include: {
				model: donations,
				as: 'donations',
				attributes: {
					exclude: ['id', 'createdAt', 'updatedAt', 'idFund', 'idUser'],
				},
				include: {
					model: users,
					as: 'users',
					attributes: {
						exclude: ['password', 'createdAt', 'updatedAt', 'idFund'],
					},
				},
			},

			attributes: {
				exclude: ['createdAt', 'updatedAt', 'idUser'],
			},
		});
		const Funds = dataFunds.map((item) => {
			return {
				id: item.id,
				title: item.title,
				thumbnail: item.thumbnail,
				goal: item.goal,
				description: item.description,
				userDonate: item.donations.map((e) => {
					return {
						id: e.users.id,
						fullName: e.users.fullName,
						email: e.users.email,
						donateAmount: e.donateAmount,
						status: e.status,
						proofattachment: e.proofattachment,
					};
				}),
			};
		});
		res.status(200).send({
			status: 'success',
			data: { funds: Funds },
		});
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.getFund = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await getFund(id);
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.addFund = async (req, res) => {
	try {
		const input = req.body;
		const newFund = await funds.create({
			...input,
			idUser: 2,
		});

		const data = await getFund(newFund.id);
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.updateFund = async (req, res) => {
	try {
		const input = req.body;
		const id = req.params.id;

		const isExist = await funds.update(input, {
			where: {
				id,
			},
		});
		if (!isExist) {
			return res.status(404).send(status_failed('fund is not exist'));
		}
		const data = await getFund(id);
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.deleteFund = async (req, res) => {
	try {
		const { id } = req.params;
		const fundExist = await funds.destroy({
			where: {
				id,
			},
		});
		if (!fundExist) {
			res.status(404).send(status_failed('fund not found'));
		}
		res.status(200).send({
			status: 'succes',
			message: `deleted fund id : ${id}`,
		});
	} catch (error) {
		res.status(400).send(status_failed(error));
	}
};
