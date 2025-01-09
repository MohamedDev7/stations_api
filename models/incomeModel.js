const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");

const IncomeModel = sequelize.define("incomes", {
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	substance_id: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},

	store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	tank_id: {
		type: DataTypes.INTEGER,
		// allowNull: false,
	},
	employee_id: {
		type: DataTypes.INTEGER,
		// allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	truck_number: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	truck_driver: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	shift_number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	start: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	end: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	type: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
IncomeModel.belongsTo(StoreModel, { foreignKey: "store_id" });
module.exports = IncomeModel;
