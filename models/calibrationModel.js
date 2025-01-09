const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");

const calibrationModel = sequelize.define("calibrations", {
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
	shift_number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.BIGINT,
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
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
calibrationModel.belongsTo(StoreModel, { foreignKey: "store_id" });
module.exports = calibrationModel;
