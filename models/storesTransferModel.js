const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");

const StoresTransferModel = sequelize.define("stores_transfers", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	from_store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	to_store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	shift_number: {
		type: DataTypes.INTEGER,
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
StoresTransferModel.belongsTo(StoreModel, { foreignKey: "from_store_id" });
StoresTransferModel.belongsTo(StoreModel, { foreignKey: "to_store_id" });
module.exports = StoresTransferModel;
