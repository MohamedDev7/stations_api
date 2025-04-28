const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const StationModel = require("./stationModel");
const SubstanceModel = require("./substanceModel");
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
	substance_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	prev_price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	curr_price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	prev_value: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	curr_value: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});
StocktakingModel.belongsTo(StationModel, { foreignKey: "station_id" });
StocktakingModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });
module.exports = StocktakingModel;
