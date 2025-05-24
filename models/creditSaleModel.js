const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const MovmentModel = require("./movmentModel");
const StationModel = require("./stationModel");

const CreditSaleModel = sequelize.define("credit_Sale", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	shift_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	from_store: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	beneficiary_store: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	isSettled: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	settlement_date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},

	employee_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
CreditSaleModel.belongsTo(StoreModel, { foreignKey: "beneficiary_store" });
CreditSaleModel.belongsTo(StationModel, { foreignKey: "station_id" });
CreditSaleModel.belongsTo(StoreModel, { foreignKey: "from_store" });
CreditSaleModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
module.exports = CreditSaleModel;
