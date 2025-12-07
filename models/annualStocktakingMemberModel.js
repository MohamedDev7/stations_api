const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineAnnualStocktakingMemberModel(sequelize, models) {
	const DispenserModel = sequelize.define("annual_stocktaking_member", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		annual_stocktaking_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
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

module.exports = defineAnnualStocktakingMemberModel;
