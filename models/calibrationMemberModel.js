const { DataTypes } = require("sequelize");

function defineCalibrationMemberModel(sequelize, models) {
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
	return CalibrationMemberModel;
}
module.exports = defineCalibrationMemberModel;
// const CalibrationMemberModel = sequelize.define("calibration_member", {
// 	calibration_report_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = CalibrationMemberModel;
