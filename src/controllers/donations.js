const express = require('express');
const { users, funds, donations } = require('../../models');

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
				exclude: ['createdAt', 'updatedAt', 'idFund'],
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
			exclude: ['createdAt', 'updatedAt'],
		},
	});
	if (!dataFund) {
		return false;
	}
	return {
		status: 'success',
		data: {
			funds: {
				id: dataFund.id,
				title: dataFund.title,
				thumbnail: dataFund.thumbnail,
				goal: dataFund.goal,
				description: dataFund.description,
				idUser: dataFund.idUser,
				userDonate: dataFund.donations.map((e) => {
					return {
						id: e.id,
						fullName: e.users.fullName,
						email: e.users.email,
						donateAmount: e.donateAmount,
						status: e.status,
						proofattachment: e.proofattachment,
					};
				}),
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
					exclude: ['createdAt', 'updatedAt', 'idFund', 'idUser'],
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
				exclude: ['createdAt', 'updatedAt'],
			},
		});
		const Funds = dataFunds.map((item) => {
			return {
				id: item.id,
				title: item.title,
				thumbnail: item.thumbnail,
				goal: item.goal,
				description: item.description,
				idUser: item.idUser,
				userDonate: item.donations.map((e) => {
					return {
						id: e.id,
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
		if (!data) {
			return res.status(404).send(status_failed('Fund is not exist'));
		}
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.addFund = async (req, res) => {
	console.log(req.body);
	try {
		const input = req.body;
		const newFund = await funds.create({
			...input,
			idUser: req.user.id,
			thumbnail: req.file.path,
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

		const isExist = await getFund(id);
		if (!isExist) {
			return res.status(404).send(status_failed('fund is not exist'));
		}
		if (isExist.data.funds.idUser !== req.user.id) {
			return res.status(401).send({
				status: 'failed',
				message: 'you dont have have access to this fund',
			});
		}

		await funds.update(input, {
			where: {
				id,
			},
		});
		const newData = await getFund(id);
		res.status(200).send(newData);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.deleteFund = async (req, res) => {
	try {
		const { id } = req.params;
		const isExist = await getFund(id);
		if (!isExist) {
			return res.status(404).send({
				status: 'error',
				message: 'fund is not exist',
			});
		}
		if (req.user.id !== isExist.data.funds.idUser) {
			return res.status(401).send({
				status: 'failed',
				message: 'you dont have access to this fund',
			});
		}
		await funds.destroy({
			where: {
				id,
			},
		});
		res.status(200).send({
			status: 'succes',
			message: `deleted fund id : ${id}`,
		});
	} catch (error) {
		res.status(400).send(status_failed(error));
	}
};

async function getDonate(id) {
	try {
		const dataDonate = await donations.findOne({
			where: {
				id,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'idUser'],
			},
		});
		if (!dataDonate) {
			return false;
		}
		return dataDonate;
	} catch (error) {
		return status_failed(error);
	}
}

exports.getDonates = async (req, res) => {
	try {
		const dataDonates = await donations.findAll({
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});
		res.status(200).send({
			status: 'success',
			data: { userdonates: dataDonates },
		});
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.getDonate = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await getDonate(id);
		if (!data) {
			return res.status(404).send(status_failed('Donations is not exist'));
		}
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.addDonate = async (req, res) => {
	try {
		const input = req.body;
		const { id } = req.params;

		const newDonate = await donations.create({
			donateAmount: input.donateAmount,
			status: 'pending',
			idFund: id,
			proofattachment: req.file.path,
			idUser: req.user.id,
		});
		const data = await getDonate(newDonate.id);
		res.status(200).send(data);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.updateDonate = async (req, res) => {
	try {
		const input = req.body;
		const { idFund, idDonate } = req.params;

		const dataFund = await getFund(idFund);

		if (!dataFund) {
			return res.status(404).send(status_failed('Fund is not exist'));
		}

		if (dataFund.data.funds.idUser !== req.user.id) {
			return res.status(404).send(status_failed('Acces Danied'));
		}

		const dataDonate = await donations.findOne({
			where: {
				id: idDonate,
				idFund,
			},
		});
		if (!dataDonate) {
			return res.status(404).send(status_failed('Donate is not exist'));
		}
		await donations.update(input, {
			where: {
				id: idDonate,
				idFund: idFund,
			},
		});

		const newFund = await getFund(idFund);

		res.status(200).send(newFund);
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};
