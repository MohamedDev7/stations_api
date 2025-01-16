const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const SubstancePriceMovmentModel = sequelize.define("substance_price_movment", {
	substance_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	start_date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	prev_price: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	curr_price: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = SubstancePriceMovmentModel;
