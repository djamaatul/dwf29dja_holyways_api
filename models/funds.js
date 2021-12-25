'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class funds extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			funds.belongsTo(models.users, {
				as: 'users',
				foreignKey: {
					name: 'idUser',
				},
			});
			funds.hasMany(models.donations, {
				as: 'donations',
				foreignKey: 'idFund',
			});
		}
	}
	funds.init(
		{
			title: DataTypes.STRING,
			thumbnail: DataTypes.STRING,
			goal: DataTypes.INTEGER,
			description: DataTypes.TEXT,
			idUser: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'funds',
		}
	);
	return funds;
};
