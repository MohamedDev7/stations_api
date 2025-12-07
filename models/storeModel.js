const { DataTypes } = require("sequelize");

function defineStoreModel(sequelize, models) {
	const StoreModel = sequelize.define("store", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		substance_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		client_id: {
			type: DataTypes.INTEGER,
		},
		is_active: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.SubstancePriceMovmentModel) {
			StoreModel.belongsTo(models.SubstancePriceMovmentModel, {
				foreignKey: "substance_id",
			});
		}
		if (models.StationModel) {
			StoreModel.belongsTo(models.StationModel, { foreignKey: "station_id" });
		}
		if (models.SubstanceModel) {
			StoreModel.belongsTo(models.SubstanceModel, {
				foreignKey: "substance_id",
			});
		}
	}
	return StoreModel;
}
module.exports = defineStoreModel;

// const sequelize = require("./../connection");
// const SubstancePriceMovmentModel = require("./substancePriceMovmentModel");
// const SubstanceModel = require("./substanceModel");
// const StationModel = require("./stationModel");

// const StoreModel = sequelize.define("store", {
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	type: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	substance_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	client_id: {
// 		type: DataTypes.INTEGER,
// 	},
// 	is_active: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// StoreModel.belongsTo(SubstancePriceMovmentModel, {
// 	foreignKey: "substance_id",
// });
// StoreModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });
// StoreModel.belongsTo(StationModel, { foreignKey: "station_id" });
// module.exports = StoreModel;
