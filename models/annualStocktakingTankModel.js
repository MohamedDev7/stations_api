const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineAnnualStocktakingTankModel(sequelize, models) {
	const DispenserModel = sequelize.define("annual_stocktaking_tank", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		annual_stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		tank_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		tank_height: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		height_in_cm: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		height_in_liter: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.TankModel) {
			DispenserModel.belongsTo(models.TankModel, { foreignKey: "tank_id" });
		}
		if (models.StationModel) {
			DispenserModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return DispenserModel;
}

module.exports = defineAnnualStocktakingTankModel;
