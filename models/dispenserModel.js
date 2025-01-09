const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const TankModel = require("./tankModel");

const DispenserModel = sequelize.define("dispenser", {
	tank_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	A: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	B: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	wheel_counter_A: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	wheel_counter_B: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
DispenserModel.belongsTo(TankModel, { foreignKey: "tank_id" });
module.exports = DispenserModel;
