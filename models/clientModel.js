const { DataTypes } = require("sequelize");
function defineClientModel(sequelize) {
	const ClientModel = sequelize.define("client", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return ClientModel;
}
module.exports = defineClientModel;
// const sequelize = require("./../connection");
// const ClientModel = sequelize.define("client", {
// 	name: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// });

// module.exports = ClientModel;
