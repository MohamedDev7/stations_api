const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const MovmentsShiftsModel = sequelize.define("movments_shift", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	start: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	end: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	state: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = MovmentsShiftsModel;
