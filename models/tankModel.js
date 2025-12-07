const { DataTypes } = require("sequelize");

function defineTankModel(sequelize, models) {
	const TankModel = sequelize.define("tank", {
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		capacity: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		dead_amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		substance_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.SubstancePriceMovmentModel) {
			TankModel.belongsTo(models.SubstancePriceMovmentModel, {
				foreignKey: "substance_id",
			});
		}
		if (models.SubstanceModel) {
			TankModel.belongsTo(models.SubstanceModel, {
				foreignKey: "substance_id",
			});
		}
	}
	return TankModel;
}
module.exports = defineTankModel;

// const sequelize = require("./../connection");

// const SubstancePriceMovmentModel = require("./substancePriceMovmentModel");
// const SubstanceModel = require("./substanceModel");

// const TankModel = sequelize.define("tank", {
// 	number: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	capacity: {
// 		type: DataTypes.BIGINT,
// 		allowNull: false,
// 	},
// 	dead_amount: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	substance_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// });
// TankModel.belongsTo(SubstancePriceMovmentModel, { foreignKey: "substance_id" });
// TankModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });
// module.exports = TankModel;
