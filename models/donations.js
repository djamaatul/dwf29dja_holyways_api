'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class donations extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			donations.belongsTo(models.funds, {
				as: 'funds',
				foreignKey: {
					name: 'idFund',
				},
			});
			donations.belongsTo(models.users, {
				as: 'users',
				foreignKey: {
					name: 'idUser',
				},
			});
		}
	}
	donations.init(
		{
			donateAmount: DataTypes.INTEGER,
			status: DataTypes.STRING,
			proofattachment: DataTypes.STRING,
			idUser: DataTypes.INTEGER,
			idFund: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'donations',
		}
	);
	return donations;
};
