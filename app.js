const express = require("express");
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
const depositsRouter = require("./routes/depositsRoute");
const receivesRouter = require("./routes/receivesRoute");
const creditSalesRouter = require("./routes/creditSalesRoute");
const incomesRouter = require("./routes/incomesRoute");
const calibrationsRouter = require("./routes/calibrationsRoute");
const surplusesRouter = require("./routes/surplusesRoute");
const movmentsRouter = require("./routes/movmentsRoute");
const reportsRouter = require("./routes/reportsRoute");
const stocktakingRouter = require("./routes/stocktakingRoutes");

const cors = require("cors");
const AppError = require("./utils/appError");
const corsOptions = {
	origin: "http://localhost:5173",
	// "Access-Control-Allow-Credentials": true,
	// optionSuccessStatus: 200,
	credentials: false,
};

// Get a list of available devices
const app = express();
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Credentials", true);
	next();
});
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v1/auth", authRouter);
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
app.use("/api/v1/deposits", depositsRouter);
app.use("/api/v1/creditSales", creditSalesRouter);

app.all("/*", (req, res, next) => {
	next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
