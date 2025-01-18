const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const StocktakingMembersModel = sequelize.define("stocktaking_Member", {
	stocktaking_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = StocktakingMembersModel;
