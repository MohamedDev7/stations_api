const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StationModel = require("./stationModel");
const EmployeesModel = require("./employeeModel");

const ReceivesModel = sequelize.define("receive", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	employee_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	user_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING,
	},
});
ReceivesModel.belongsTo(StationModel, { foreignKey: "station_id" });
ReceivesModel.belongsTo(EmployeesModel, { foreignKey: "employee_id" });
module.exports = ReceivesModel;
