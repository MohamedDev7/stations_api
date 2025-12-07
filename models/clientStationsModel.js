const { DataTypes } = require("sequelize");
// const sequelize = require("./../connection");
// const ClientModel = require("./clientModel");
function defineClientStationsModel(sequelize, models) {
	const ClientStationsModel = sequelize.define("client_station", {
		client_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		station_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		allow_credit: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	});
	if (models) {
		if (models.ClientModel) {
			ClientStationsModel.belongsTo(models.ClientModel, {
				foreignKey: "client_id",
			});
		}
	}
	return ClientStationsModel;
}
module.exports = defineClientStationsModel;
// const ClientStationsModel = sequelize.define("client_station", {
// 	client_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	station_id: {
// 		type: DataTypes.INTEGER,
// 		allowNull: false,
// 	},
// 	allow_credit: {
// 		type: DataTypes.BOOLEAN,
// 		allowNull: false,
// 	},
// });
// ClientStationsModel.belongsTo(ClientModel, { foreignKey: "client_id" });
// module.exports = ClientStationsModel;
