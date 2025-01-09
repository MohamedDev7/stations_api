const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const EmployeesModel = sequelize.define("employee", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
module.exports = EmployeesModel;
