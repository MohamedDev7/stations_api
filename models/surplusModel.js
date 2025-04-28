const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const StationModel = require("./stationModel");
const MovmentModel = require("./movmentModel");
const SurplusModel = sequelize.define("surplus", {
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
	stocktaking_id: {
		type: DataTypes.INTEGER,
	},
	store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	state: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	price: {
		type: DataTypes.INTEGER,
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
});

SurplusModel.belongsTo(StoreModel, { foreignKey: "store_id" });
SurplusModel.belongsTo(StationModel, { foreignKey: "station_id" });
SurplusModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
module.exports = SurplusModel;
