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
const incomesRouter = require("./routes/incomesRoute");
const movmentsRouter = require("./routes/movmentsRoute");
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
app.use("/api/v1/income", incomesRouter);
app.use("/api/v1/movments", movmentsRouter);
app.use("/api/v1/stocktaking", stocktakingRouter);

app.all("/*", (req, res, next) => {
	next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
