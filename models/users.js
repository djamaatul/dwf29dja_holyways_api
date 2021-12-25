'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class users extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			users.hasMany(models.funds, {
				as: 'funds',
				foreignKey: 'idUser',
			});
			users.hasMany(models.donations, {
				as: 'donations',
				foreignKey: 'idUser',
			});
		}
	}
	users.init(
		{
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			fullName: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'users',
		}
	);
	return users;
};
