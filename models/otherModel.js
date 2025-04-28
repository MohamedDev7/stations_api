const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StoreModel = require("./storeModel");
const MovmentModel = require("./movmentModel");

const OtherModel = sequelize.define("others", {
	amount: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	store_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},

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
	// shift_number: {
	// 	type: DataTypes.INTEGER,
	// 	allowNull: false,
	// },
	// start: {
	// 	type: DataTypes.TIME,
	// 	allowNull: false,
	// },
	// end: {
	// 	type: DataTypes.TIME,
	// 	allowNull: false,
	// },
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	employee_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
OtherModel.belongsTo(StoreModel, { foreignKey: "store_id" });
OtherModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
module.exports = OtherModel;
