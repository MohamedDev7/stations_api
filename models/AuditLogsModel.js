const { DataTypes } = require("sequelize");
const sequelize = require("./../connection");
const AuditLog = sequelize.define(
	"AuditLog",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		action: {
			type: DataTypes.STRING, // 'CREATE', 'UPDATE', 'DELETE'
			allowNull: false,
		},
		tableName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		recordId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		oldData: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		newData: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		paranoid: false,
	}
);
module.exports = AuditLog;
