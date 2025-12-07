const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");

function definePriceMovmentEntriesModel(sequelize, models) {
	const PriceMovmentEntriesModel = sequelize.define("price_movment_entries", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		creditor: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		debtor: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		prev_price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		curr_price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StoreModel) {
			PriceMovmentEntriesModel.belongsTo(models.StoreModel, {
				foreignKey: "store_id",
			});
		}
	}
	return PriceMovmentEntriesModel;
}

module.exports = definePriceMovmentEntriesModel;
// const priceMovmentEntriesModel = sequelize.define("price_movment_entries", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	stocktaking_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	creditor: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	debtor: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	prev_price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	curr_price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	amount: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 	},
// });
// priceMovmentEntriesModel.belongsTo(StoreModel, {
// 	foreignKey: "store_id",
// });
// module.exports = priceMovmentEntriesModel;
