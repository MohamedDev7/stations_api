const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const StationModel = sequelize.define("station", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	shifts: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	province: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
module.exports = StationModel;
