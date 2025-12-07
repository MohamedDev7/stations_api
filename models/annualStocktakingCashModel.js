const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineAnnualStocktakingCashModel(sequelize, models) {
	const DispenserModel = sequelize.define("annual_stocktaking_cash", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		annual_stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		1000: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		500: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		200: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		100: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		50: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		20: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		10: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		5: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		1: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
	if (models) {
		if (models.StationModel) {
			DispenserModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return DispenserModel;
}

module.exports = defineAnnualStocktakingCashModel;
