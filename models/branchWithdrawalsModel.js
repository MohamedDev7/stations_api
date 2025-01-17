const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const BranchWithdrawalsModel = sequelize.define("branch_withdrawals", {
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	shift_number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	store_movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
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

	start: {
		type: DataTypes.TIME,
		allowNull: false,
	},
	end: {
		type: DataTypes.TIME,
		allowNull: false,
	},
});
BranchWithdrawalsModel.belongsTo(StoreModel, { foreignKey: "store_id" });
module.exports = BranchWithdrawalsModel;
