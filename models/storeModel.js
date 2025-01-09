const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const SubstanceModel = require("./substanceModel");

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
StoreModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });

module.exports = StoreModel;
