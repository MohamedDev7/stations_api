const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StationModel = require("./stationModel");

const CreditSaleSettlementModel = sequelize.define("credit_sales_settlements", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},

	_date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
});
CreditSaleSettlementModel.belongsTo(StationModel, { foreignKey: "station_id" });
module.exports = CreditSaleSettlementModel;
