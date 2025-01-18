const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");

const StocktakingStoresMovmentsModel = sequelize.define(
	"stocktaking_stores_movment",
	{
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
		stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}
);
StocktakingStoresMovmentsModel.belongsTo(StoreModel, {
	foreignKey: "store_id",
});
module.exports = StocktakingStoresMovmentsModel;
