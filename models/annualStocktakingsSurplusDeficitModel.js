const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineAnnualStocktakingSurplusDeficitModel(sequelize, models) {
	const DispenserModel = sequelize.define(
		"annual_stocktaking_surplus_deficit",
		{
			station_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			annual_stocktaking_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			substance_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			deficit: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			surplus: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		}
	);
	if (models) {
		if (models.StationModel) {
			DispenserModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return DispenserModel;
}

module.exports = defineAnnualStocktakingSurplusDeficitModel;
