const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const StationModel = require("./stationModel");
// const SubstanceModel = require("./substanceModel");
// const StoreModel = require("./storeModel");

function defineQuantityDeductionModel(sequelize, models) {
	const QuantityDeductionModel = sequelize.define("quantity_deduction", {
		movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		substance_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		curr_value: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		prev_value: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		store_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StationModel) {
			QuantityDeductionModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
		if (models.StoreModel) {
			QuantityDeductionModel.belongsTo(models.StoreModel, {
				foreignKey: "store_id",
			});
		}
		if (models.SubstanceModel) {
			QuantityDeductionModel.belongsTo(models.SubstanceModel, {
				foreignKey: "substance_id",
			});
		}
	}
	return QuantityDeductionModel;
}
module.exports = defineQuantityDeductionModel;

// const QuantityDeductionModel = sequelize.define("quantity_deduction", {
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	date: {
// 		type: DataTypes.DATEONLY,
// 		allowNull: false,
// 	},

// 	substance_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	amount: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	curr_value: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	prev_value: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// QuantityDeductionModel.belongsTo(StationModel, { foreignKey: "station_id" });
// QuantityDeductionModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// QuantityDeductionModel.belongsTo(SubstanceModel, {
// 	foreignKey: "substance_id",
// });
// module.exports = QuantityDeductionModel;
