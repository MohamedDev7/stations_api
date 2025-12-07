const { DataTypes } = require("sequelize");

function defineBankModel(sequelize) {
	const BankModel = sequelize.define("bank", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return BankModel;
}
module.exports = defineBankModel;

// const { DataTypes } = require("sequelize");
// function defineBeneficiaryModel(sequelize, models) {
// 	const BeneficiaryModel = sequelize.define(
// 		"beneficiary",
// 		{
// 			name: {
// 				type: DataTypes.STRING,
// 				allowNull: false,
// 			},
// 			job_title_id: {
// 				type: DataTypes.INTEGER,
// 				allowNull: true,
// 			},
// 			job_type_id: {
// 				type: DataTypes.INTEGER,
// 				allowNull: true,
// 			},
// 			job_degree_id: {
// 				type: DataTypes.INTEGER,
// 				allowNull: true,
// 			},
// 			phone_number: {
// 				type: DataTypes.INTEGER,
// 				allowNull: true,
// 			},
// 			department_id: {
// 				type: DataTypes.INTEGER,
// 				allowNull: true,
// 			},
// 			type: {
// 				type: DataTypes.STRING,
// 				allowNull: false,
// 			},
// 		},
// 		{
// 			timestamps: false,

// 			underscored: true,
// 		}
// 	);

// 	// Setup associations — expects job models passed in `models`
// 	if (models) {
// 		if (models.JobTitleModel) {
// 			BeneficiaryModel.belongsTo(models.JobTitleModel, {
// 				foreignKey: "job_title_id",
// 			});
// 		}
// 		if (models.JobTypeModel) {
// 			BeneficiaryModel.belongsTo(models.JobTypeModel, {
// 				foreignKey: "job_type_id",
// 			});
// 		}
// 		if (models.JobDegreeModel) {
// 			BeneficiaryModel.belongsTo(models.JobDegreeModel, {
// 				foreignKey: "job_degree_id",
// 			});
// 		}
// 		if (models.DepartmentModel) {
// 			BeneficiaryModel.belongsTo(models.DepartmentModel, {
// 				foreignKey: "department_id",
// 			});
// 		}
// 	}

// 	return BeneficiaryModel;
// }

// module.exports = defineBeneficiaryModel;
