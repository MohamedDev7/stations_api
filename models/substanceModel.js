const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");

const SubstanceModel = sequelize.define("substance", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = SubstanceModel;
