const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const TankModel = require("./tankModel");
// const StationModel = require("./stationModel");

function defineAnnualStocktakingModel(sequelize, models) {
	const DispenserModel = sequelize.define("annual_stocktaking", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		time: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		last_movment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		last_income_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		day: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		portfolio_number: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		portfolio_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		last_deposit_id: {
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
		if (models.MovmentModel) {
			DispenserModel.belongsTo(models.MovmentModel, {
				foreignKey: "last_movment_id",
			});
		}
		if (models.IncomeModel) {
			DispenserModel.belongsTo(models.IncomeModel, {
				foreignKey: "last_income_id",
			});
		}
	}
	return DispenserModel;
}

module.exports = defineAnnualStocktakingModel;
