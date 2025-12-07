const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StationModel = require("./stationModel");
// const StoreModel = require("./storeModel");
// const ClientModel = require("./clientModel");

function defineCreditSaleSettlementModel(sequelize, models) {
	const CreditSaleSettlementModel = sequelize.define(
		"credit_sales_settlements",
		{
			station_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			client_id: {
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
			date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			operation_number: {
				type: DataTypes.STRING,
			},
		}
	);
	if (models) {
		if (models.StationModel) {
			CreditSaleSettlementModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.StoreModel) {
			CreditSaleSettlementModel.belongsTo(models.StoreModel, {
				foreignKey: "store_id",
			});
		}
		if (models.ClientModel) {
			CreditSaleSettlementModel.belongsTo(models.ClientModel, {
				foreignKey: "client_id",
			});
		}
	}
	return CreditSaleSettlementModel;
}
module.exports = defineCreditSaleSettlementModel;
// const CreditSaleSettlementModel = sequelize.define("credit_sales_settlements", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	client_id: {
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
// 	date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 	},

// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	operation_number: {
// 		type: DataTypes.STRING,
// 	},
// });
// CreditSaleSettlementModel.belongsTo(StationModel, { foreignKey: "station_id" });
// CreditSaleSettlementModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// CreditSaleSettlementModel.belongsTo(ClientModel, { foreignKey: "client_id" });
// module.exports = CreditSaleSettlementModel;
