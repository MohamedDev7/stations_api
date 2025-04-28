const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const StationModel = require("./stationModel");
const MovmentModel = require("./movmentModel");
const DispenserModel = require("./dispenserModel");

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
	// start: {
	// 	type: DataTypes.TIME,
	// 	allowNull: false,
	// },
	// end: {
	// 	type: DataTypes.TIME,
	// 	allowNull: false,
	// },
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
CalibrationModel.belongsTo(StoreModel, { foreignKey: "store_id" });
CalibrationModel.belongsTo(StationModel, { foreignKey: "station_id" });
CalibrationModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
CalibrationModel.belongsTo(DispenserModel, { foreignKey: "dispenser_id" });
module.exports = CalibrationModel;
