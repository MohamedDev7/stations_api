const { sequelizeStations } = require("../connection");
// const defineDuesListModel = require("../models/duesListModel");
// Add other model imports and define functions similarly

// Initialize models on each sequelize instance
// const models = {
// 	elec: {
// 		duesList: defineDuesListModel(sequelizeElec),
// 		// other models...
// 	},
// 	elec2024: {
// 		duesList: defineDuesListModel(sequelizeElec2024),
// 		// other models...
// 	},
// };

// Middleware to select Sequelize instance per request
exports.selectDbMiddleware = (req, res, next) => {
	const year = req.headers["x-year"] || req.query.year || null;

	req.db = sequelizeStations;
	next();
};

// // Utility function to get model based on year and model name
// exports.getModel = (year, modelName) => {
// 	const dbKey = year === "2024" ? "elec2024" : "elec";

// 	if (!models[dbKey]) {
// 		throw new Error(`Database instance for year '${year}' not configured`);
// 	}
// 	if (!models[dbKey][modelName]) {
// 		throw new Error(`Model '${modelName}' not found for database '${dbKey}'`);
// 	}

// 	return models[dbKey][modelName];
// };
