const {
	sequelizeStations2025,
	sequelizeStations2026,
} = require("../connection");

const sequelizeStations = sequelizeStations2026; // Default for current year

// Map of year to database connection
const dbConnections = {
	stations: sequelizeStations,
	"stations-2025": sequelizeStations2025,
	"stations-2026": sequelizeStations2026,
	// Add more years here as needed
};

// Middleware to read year from request and set db connection
exports.selectDbMiddleware = (req, res, next) => {
	// Read year from x-year header, query param, or body
	const year =
		req.headers["x-year"] || req.query.year || req.body?.year || null;
	req.year = year;

	// Set db connection based on year
	const serverYear = process.env.YEAR;
	if (year && year !== serverYear) {
		req.db = dbConnections[`stations-${year}`] || sequelizeStations;
	} else {
		req.db = sequelizeStations;
	}

	next();
};
