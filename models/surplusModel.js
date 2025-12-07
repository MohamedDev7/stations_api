const { DataTypes } = require("sequelize");

function defineSurplusModel(sequelize, models) {
	const SurplusModel = sequelize.define("surplus", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		movment_id: {
			type: DataTypes.INTEGER,
		},
		shift_id: {
			type: DataTypes.INTEGER,
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
		date: {
			type: DataTypes.DATEONLY,
		},
	});
	if (models) {
		if (models.StoreModel) {
			SurplusModel.belongsTo(models.StoreModel, { foreignKey: "store_id" });
		}
		if (models.StationModel) {
			SurplusModel.belongsTo(models.StationModel, { foreignKey: "station_id" });
		}
		if (models.MovmentModel) {
			SurplusModel.belongsTo(models.MovmentModel, { foreignKey: "movment_id" });
		}
		if (models.StocktakingModel) {
			SurplusModel.belongsTo(models.StocktakingModel, {
				foreignKey: "stocktaking_id",
			});
		}
	}
	return SurplusModel;
}
module.exports = defineSurplusModel;

// const sequelize = require("./../connection");
// const StoreModel = require("./storeModel");
// const StationModel = require("./stationModel");
// const MovmentModel = require("./movmentModel");
// const SurplusModel = sequelize.define("surplus", {
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	movment_id: {
// 		type: DataTypes.INTEGER,
// 	},
// 	shift_id: {
// 		type: DataTypes.INTEGER,
// 	},
// 	stocktaking_id: {
// 		type: DataTypes.INTEGER,
// 	},
// 	store_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	amount: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	state: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	price: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	date: {
// 		type: DataTypes.DATEONLY,
// 	},
// });

// SurplusModel.belongsTo(StoreModel, { foreignKey: "store_id" });
// SurplusModel.belongsTo(StationModel, { foreignKey: "station_id" });
// SurplusModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
// module.exports = SurplusModel;
