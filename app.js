const express = require("express");
// const session = require("express-session");
// const SequelizeStore = require("connect-session-sequelize")(session.Store);
const globalErrorHandler = require("./controllers/errorController");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const authController = require("./controllers/authController");
const substancesRouter = require("./routes/substancesRoute");
const stationsRouter = require("./routes/stationsRoute");
const tanksRouter = require("./routes/tanksRoute");
const shiftsRouter = require("./routes/shiftsRoute");
const dispensersRouter = require("./routes/dispensersRoute");
const storesRouter = require("./routes/storesRoute");
const employeesRouter = require("./routes/employeesRoute");
const banksRouter = require("./routes/banksRoute");
const branchWithdrawalsRouter = require("./routes/branchWithdrawalRoute");
const depositsRouter = require("./routes/depositsRoute");
const receivesRouter = require("./routes/receivesRoute");
const creditSalesRouter = require("./routes/creditSalesRoute");
const incomesRouter = require("./routes/incomesRoute");
const calibrationsRouter = require("./routes/calibrationsRoute");
const surplusesRouter = require("./routes/surplusesRoute");
const movmentsRouter = require("./routes/movmentsRoute");
const reportsRouter = require("./routes/reportsRoute");
const stocktakingRouter = require("./routes/stocktakingRoutes");
const clientsRouter = require("./routes/clientsRoute");
const notificationsRouter = require("./routes/notificationsRoute");
const quantityDeductionsRouter = require("./routes/quantityDeductionsRoutes");
const stationsClosedMonthsRouter = require("./routes/stationsClosedMonthsRoute");
const financialOperationsRouter = require("./routes/financialOperationsRoute");
const { selectDbMiddleware } = require("./controllers/dbSelectController");
const annualStocktakingRouter = require("./routes/annualStocktakingRoutes");
// const { sequelizeStations } = require("./connection");
// const { getModel } = require("./utils/modelSelect");

const cors = require("cors");
const AppError = require("./utils/appError");
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like Electron apps, mobile apps, curl, etc.)
		if (!origin) return callback(null, true);
		// Allow all origins for now - adjust as needed for security
		return callback(null, true);
	},
	credentials: true,
	allowedHeaders: ["Content-Type", "Authorization", "x-year", "AppVersion"],
};

// SESSION CODE COMMENTED OUT - Using JWT tokens instead
// const SessionModel = getModel(process.env.YEAR, "session");
// const sessionStore = new SequelizeStore({
// 	db: sequelizeStations,
// 	table: SessionModel,
// 	checkExpirationInterval: 0,
// });
// SessionModel.sync({ alter: true });

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// SESSION MIDDLEWARE COMMENTED OUT - Using JWT tokens instead
// app.use(
// 	session({
// 		secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
// 		store: sessionStore,
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: {
// 			secure: false,
// 			httpOnly: true,
// 			sameSite: false,
// 			maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
// 		},
// 	})
// );

app.use("/api/v1/auth", authRouter);
app.use("/*", selectDbMiddleware); // Set req.year from header/query/body first
app.all("/*", authController.protect);
app.all("/*", authController.restrictToStations);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/substances", substancesRouter);
app.use("/api/v1/stations", stationsRouter);
app.use("/api/v1/dispensers", dispensersRouter);
app.use("/api/v1/tanks", tanksRouter);
app.use("/api/v1/shifts", shiftsRouter);
app.use("/api/v1/stores", storesRouter);
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/receives", receivesRouter);
app.use("/api/v1/income", incomesRouter);
app.use("/api/v1/calibration", calibrationsRouter);
app.use("/api/v1/surplus", surplusesRouter);
app.use("/api/v1/movments", movmentsRouter);
app.use("/api/v1/stocktaking", stocktakingRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/banks", banksRouter);
app.use("/api/v1/branchWithdrawals", branchWithdrawalsRouter);
app.use("/api/v1/deposits", depositsRouter);
app.use("/api/v1/creditSales", creditSalesRouter);
app.use("/api/v1/clients", clientsRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/quantityDeductions", quantityDeductionsRouter);
app.use("/api/v1/closing", stationsClosedMonthsRouter);
app.use("/api/v1/financialOperations", financialOperationsRouter);
app.use("/api/v1/annualStocktaking", annualStocktakingRouter);

app.all("/*", (req, res, next) => {
	next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
