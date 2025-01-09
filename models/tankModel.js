const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const SubstanceModel = require("./substanceModel");

const TankModel = sequelize.define("tank", {
	number: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	capacity: {
		type: DataTypes.BIGINT,
		allowNull: false,
	},
	dead_amount: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	substance_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	station_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});
TankModel.belongsTo(SubstanceModel, { foreignKey: "substance_id" });
module.exports = TankModel;
