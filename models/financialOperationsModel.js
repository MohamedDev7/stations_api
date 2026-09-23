const { DataTypes } = require("sequelize");

function defineFinancialOperationsModel(sequelize, models) {
	const FinancialOperationsModel = sequelize.define("financial_operations", {
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		debtor: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0,
		},
		creditor: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		statement: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	});
	if (models) {
		if (models.StationModel) {
			FinancialOperationsModel.belongsTo(models.StationModel, {
				foreignKey: "station_id",
			});
		}
	}
	return FinancialOperationsModel;
}
module.exports = defineFinancialOperationsModel;
