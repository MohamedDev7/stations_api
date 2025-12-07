const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const StationModel = require("./stationModel");
// const MovmentModel = require("./movmentModel");

function defineCalibrationReportModel(sequelize, models) {
	const CalibrationReportModel = sequelize.define("calibrations_report", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		shift_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StationModel) {
			CalibrationReportModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.MovmentModel) {
			CalibrationReportModel.belongsTo(models.MovmentModel, {
				foreignKey: "movment_id",
			});
		}
	}
	return CalibrationReportModel;
}
module.exports = defineCalibrationReportModel;
// const CalibrationReportModel = sequelize.define("calibrations_report", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},

// 	shift_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// CalibrationReportModel.belongsTo(StationModel, { foreignKey: "station_id" });
// CalibrationReportModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// module.exports = CalibrationReportModel;
