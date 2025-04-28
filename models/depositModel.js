const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StationModel = require("./stationModel");
const BankModel = require("./bankModel");
const DepositModel = sequelize.define("deposits", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	bank_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	number: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	invoice_date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	statement: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	user_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
DepositModel.belongsTo(StationModel, { foreignKey: "station_id" });
DepositModel.belongsTo(BankModel, { foreignKey: "bank_id" });
module.exports = DepositModel;
