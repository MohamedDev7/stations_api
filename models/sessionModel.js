const { DataTypes } = require("sequelize");

function defineSessionModel(sequelize) {
	const SessionModel = sequelize.define(
		"Session",
		{
			sid: {
				type: DataTypes.STRING(36),
				primaryKey: true,
			},
			expires: {
				type: DataTypes.DATE,
			},
			data: {
				type: DataTypes.TEXT,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			device_id: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
		},
		{
			tableName: "Sessions",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: false,
		}
	);
	return SessionModel;
}

module.exports = defineSessionModel;
