const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const TankMovmentModel = sequelize.define("tanks_movments", {
	prev_value: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	curr_value: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	tank_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
module.exports = TankMovmentModel;
