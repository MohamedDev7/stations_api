const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const MovmentModel = require("./movmentModel");
// const StationModel = require("./stationModel");
// const ClientModel = require("./clientModel");
// const EmployeesModel = require("./employeeModel");
// const CreditSaleSettlementModel = require("./creditSaleSettlementModel");

function defineCreditSaleModel(sequelize, models) {
	const CreditSaleModel = sequelize.define("credit_sale", {
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
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		client_id: {
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
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isSettled: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},

		settlement_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		employee_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StoreModel) {
			CreditSaleModel.belongsTo(models.StoreModel, { foreignKey: "store_id" });
		}
		if (models.StationModel) {
			CreditSaleModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.MovmentModel) {
			CreditSaleModel.belongsTo(models.MovmentModel, {
				foreignKey: "movment_id",
			});
		}
		if (models.ClientModel) {
			CreditSaleModel.belongsTo(models.ClientModel, {
				foreignKey: "client_id",
			});
		}
		if (models.EmployeesModel) {
			CreditSaleModel.belongsTo(models.EmployeesModel, {
				foreignKey: "employee_id",
			});
		}
		if (models.CreditSaleSettlementModel) {
			CreditSaleModel.belongsTo(models.CreditSaleSettlementModel, {
				foreignKey: "settlement_id",
			});
		}
	}
	return CreditSaleModel;
}
module.exports = defineCreditSaleModel;
// const CreditSaleModel = sequelize.define("credit_sale", {
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
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	client_id: {
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
// 	title: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	isSettled: {
// 		type: DataTypes.INTEGER,
// 		allowNull: true,
// 	},

// 	settlement_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: true,
// 	},
// 	employee_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// CreditSaleModel.belongsTo(ClientModel, { foreignKey: "client_id" });
// CreditSaleModel.belongsTo(StationModel, { foreignKey: "station_id" });
// CreditSaleModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// CreditSaleModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// CreditSaleModel.belongsTo(EmployeesModel, { foreignKey: "employee_id" });
// CreditSaleModel.belongsTo(CreditSaleSettlementModel, {
// 	foreignKey: "settlement_id",
// });
// module.exports = CreditSaleModel;
