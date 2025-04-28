const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const StationModel = require("./stationModel");
const MovmentModel = require("./movmentModel");

const StoreMovmentModel = sequelize.define("stores_movments", {
	prev_value: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	curr_value: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	shift_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	// shift_number: {
	// 	type: DataTypes.INTEGER,
	// 	allowNull: false,
	// },
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	station_id: {
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
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	state: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	deficit: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
});
StoreMovmentModel.belongsTo(StoreModel, {
	foreignKey: "store_id",
});
StoreMovmentModel.belongsTo(MovmentModel, {
	foreignKey: "movment_id",
});

module.exports = StoreMovmentModel;
