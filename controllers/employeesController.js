const catchAsync = require("../utils/catchAsync");
const EmployeeModel = require("./../models/employeeModel");
const AppError = require("../utils/appError");
exports.getAllEmployees = catchAsync(async (req, res, next) => {
	try {
		const employees = await EmployeeModel.findAll();
		res.status(200).json({
			state: "success",
			employees,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getEmployee = catchAsync(async (req, res, next) => {
	try {
		const employee = await EmployeeModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			employee,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getEmployeesByStationId = catchAsync(async (req, res, next) => {
	try {
		const employees = await EmployeeModel.findAll({
			where: {
				station_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			employees,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addEmployee = catchAsync(async (req, res, next) => {
	try {
		const employee = await EmployeeModel.create({
			name: req.body.name,
			staton_id: req.body.stationID,
		});
		res.status(200).json({
			state: "success",
			employee,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteEmployee = catchAsync(async (req, res, next) => {
	try {
		await EmployeeModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
	try {
		await EmployeeModel.update(
			{ name: req.body.name, station_id: req.body.stationId },
			{
				where: { id: req.params.id },
			}
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
