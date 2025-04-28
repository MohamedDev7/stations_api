const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const SubstancePriceMovmentModel = require("./substancePriceMovmentModel");
const SubstanceModel = require("./substanceModel");
const StationModel = require("./stationModel");

const StoreModel = sequelize.define("store", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	substance_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
StoreModel.belongsTo(SubstancePriceMovmentModel, {
	foreignKey: "substance_id",
});
StoreModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });
StoreModel.belongsTo(StationModel, { foreignKey: "station_id" });
module.exports = StoreModel;
