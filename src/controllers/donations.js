const e = require('express');
const express = require('express');
const fs = require('fs');
const { users, funds, donations } = require('../../models');
const fundsUrl = 'http://localhost:5000/assets/funds/';
const invoicesUrl = 'http://localhost:5000/assets/invoices/';
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
				exclude: ['updatedAt', 'idFund'],
			},
			include: {
				model: users,
				as: 'users',
				attributes: {
					exclude: ['password', 'createdAt', 'updatedAt', 'idFund'],
				},
			},
		},
	});
	if (!dataFund) {
		return false;
	}
	return dataFund;
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
		dataFunds.map((e) => {
			e.thumbnail = fundsUrl + e.thumbnail;
			e.donations.map((item) => (item.proofattachment = invoicesUrl + item.proofattachment));
		});
		res.status(200).send({
			status: 'success',
			data: dataFunds,
		});
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};
exports.getFundsUser = async (req, res) => {
	try {
		let fundsUser = await funds.findAll({
			where: {
				idUser: req.user.id,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});
		fundsUser.map((e) => (e.thumbnail = fundsUrl + e.thumbnail));
		res.status(200).send({
			status: 'success',
			data: fundsUser,
		});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};
exports.getFund = async (req, res) => {
	try {
		const { id } = req.params;
		const dataFund = await getFund(id);

		if (!dataFund) {
			return res.status(404).send(status_failed('Fund is not exist'));
		}

		dataFund.thumbnail = fundsUrl + dataFund.thumbnail;
		dataFund.donations.map((e) => {
			return (e.proofattachment = invoicesUrl + e.proofattachment);
		}),
			res.status(200).send({
				status: 'success',
				data: dataFund,
			});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.addFund = async (req, res) => {
	console.log(req.body);
	try {
		const input = req.body;
		const newFund = await funds.create({
			...input,
			idUser: req.user.id,
			thumbnail: req.file.filename,
			collected: 0,
		});
		const responseData = await getFund(newFund.id);
		res.status(200).send(responseData);
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.updateFund = async (req, res) => {
	try {
		const input = req.body;
		const id = req.params.id;

		const dataFund = await getFund(id);
		if (!dataFund) {
			return res.status(404).send(status_failed('fund is not exist'));
		}
		if (dataFund.idUser !== req.user.id) {
			return res.status(401).send({
				status: 'failed',
				message: 'you dont have have access to this fund',
			});
		}
		if (req.file) {
			fs.unlink('assets/funds/' + dataFund.thumbnail, (error) => {
				console.log(error);
			});
		}
		await funds.update(
			{ ...input, thumbnail: req.file?.filename ?? dataFund.thumbnail },
			{
				where: {
					id,
				},
			}
		);
		const newData = await getFund(id);
		res.status(200).send(newData);
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.deleteFund = async (req, res) => {
	try {
		const { id } = req.params;
		const dataFund = await getFund(id);
		if (!dataFund) {
			return res.status(404).send({
				status: 'error',
				message: 'fund is not exist',
			});
		}
		if (req.user.id !== dataFund.idUser) {
			return res.status(401).send({
				status: 'failed',
				message: 'you dont have access to this fund',
			});
		}

		fs.unlink('assets/funds/' + dataFund.thumbnail, (error) => {
			console.log(error);
		});
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
		res.status(500).send(status_failed(error));
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
		dataDonates.map((e) => (e.proofattachment = invoicesUrl + e.proofattachment));
		res.status(200).send({
			status: 'success',
			data: dataDonates,
		});
	} catch (error) {
		res.status(400).send(status_failed('server error'));
	}
};

exports.getDonate = async (req, res) => {
	try {
		const { id } = req.params;
		const dataDonate = await getDonate(id);
		if (!dataDonate) {
			return res.status(404).send(status_failed('Donations is not exist'));
		}
		dataDonate.proofattachment = invoicesUrl + dataDonate.proofattachment;
		res.status(200).send({
			status: 'success',
			data: dataDonate,
		});
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};

exports.addDonate = async (req, res) => {
	try {
		const input = req.body;
		const { id } = req.params;

		if (!req.file) {
			return res.status(400).send({
				status: 'failed',
				message: 'please upload file!',
			});
		}

		const newDonate = await donations.create({
			donateAmount: input.donateAmount,
			status: 'pending',
			idFund: id,
			proofattachment: req.file.filename,
			idUser: req.user.id,
		});
		const data = await getDonate(newDonate.id);
		res.status(200).send(data);
	} catch (error) {
		res.status(500).send(status_failed('server error'));
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

		if (dataFund.idUser !== req.user.id) {
			return res.status(401).send(status_failed('Acces Danied'));
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
		// if (input.status) {
		// 	if (dataDonate.status !== input.status) {
		// 		if (input.status == 'success') {
		// let oldFund = await funds.findOne({
		// 	where: {
		// 		id: idFund,
		// 	},
		// });
		// 			await funds.update(
		// 				{
		// 					...oldFund,
		// 					collected: oldFund.collected + dataDonate.donateAmount,
		// 				},
		// {
		// 	where: {
		// 		id: idFund,
		// 	},
		// }
		// 			);
		// 		// }
		// 	} else {
		// 		res.status(200).send({
		// 			status: 'failed',
		// 			message: 'data has ready uptodate',
		// 		});
		// 	}
		// }
		if (req.file) {
			fs.unlink('assets/invoices/' + dataDonate.proofattachment, (error) => {
				console.log(error);
			});
		}

		await donations.update(
			{
				...input,
				proofattachment: req.file?.filename ?? dataDonate.proofattachment,
			},
			{
				where: {
					id: idDonate,
					idFund: idFund,
				},
			}
		);
		let oldFund = await funds.findOne({
			include: {
				model: donations,
				as: 'donations',
				attributes: {
					exclude: ['createdAt', 'updatedAt', 'idFund'],
				},
			},
			where: {
				id: idFund,
			},
		});
		let countCollected = 0;
		oldFund.donations.map((e) => {
			if (e.status == 'success') {
				let donate = parseInt(e.donateAmount);
				countCollected += donate;
			}
		});

		await funds.update(
			{ collected: countCollected },
			{
				where: {
					id: idFund,
				},
			}
		);

		const newFund = await getDonate(idFund);
		res.status(200).send(newFund);
	} catch (error) {
		res.status(500).send(status_failed('server error'));
	}
};
