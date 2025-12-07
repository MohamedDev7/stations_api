const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const StationModel = require("./stationModel");
// const MovmentModel = require("./movmentModel");
// const DispenserModel = require("./dispenserModel");

function defineCalibrationModel(sequelize, models) {
	const CalibrationModel = sequelize.define("calibrations", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},

		amount: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		prev_A: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		prev_B: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		curr_A: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		curr_B: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		calibration_report_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		dispenser_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StoreModel) {
			CalibrationModel.belongsTo(models.StoreModel, { foreignKey: "store_id" });
		}
		if (models.StationModel) {
			CalibrationModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.MovmentModel) {
			CalibrationModel.belongsTo(models.MovmentModel, {
				foreignKey: "movment_id",
			});
		}
		if (models.DispenserModel) {
			CalibrationModel.belongsTo(models.DispenserModel, {
				foreignKey: "dispenser_id",
			});
		}
	}
	return CalibrationModel;
}
module.exports = defineCalibrationModel;
// const CalibrationModel = sequelize.define("calibrations", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},

// 	amount: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},

// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	prev_A: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	prev_B: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	curr_A: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	curr_B: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	calibration_report_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	dispenser_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// CalibrationModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// CalibrationModel.belongsTo(StationModel, { foreignKey: "station_id" });
// CalibrationModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// CalibrationModel.belongsTo(DispenserModel, { foreignKey: "dispenser_id" });
// module.exports = CalibrationModel;
