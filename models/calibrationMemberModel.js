const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const CalibrationMemberModel = sequelize.define("calibration_member", {
	calibration_report_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = CalibrationMemberModel;
