const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const calibrationMemberModel = sequelize.define("calibration_member", {
	calibration_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = calibrationMemberModel;
