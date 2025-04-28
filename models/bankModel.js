const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const BankModel = sequelize.define("bank", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});
module.exports = BankModel;
