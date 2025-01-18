const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StocktakingModel = sequelize.define("stocktaking", {
	movment_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
});

module.exports = StocktakingModel;
