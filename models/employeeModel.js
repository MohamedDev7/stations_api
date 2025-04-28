const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StationModel = require("./stationModel");

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
EmployeesModel.belongsTo(StationModel, { foreignKey: "station_id" });
module.exports = EmployeesModel;
