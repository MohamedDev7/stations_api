const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const DispenserModel = require("./dispenserModel");
const ShiftModel = require("./shiftModel");
const MovmentModel = require("./movmentModel");
const DispenserMovmentModel = sequelize.define("dispensers_movments", {
	prev_A: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	curr_A: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	prev_B: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	curr_B: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	tank_id: {
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
	dispenser_id: {
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
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	is_active: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	employee_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	state: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});
DispenserMovmentModel.belongsTo(DispenserModel, { foreignKey: "dispenser_id" });
DispenserMovmentModel.belongsTo(MovmentModel, { foreignKey: "movment_id" });
module.exports = DispenserMovmentModel;
