const catchAsync = require("../utils/catchAsync");
const EmployeeModel = require("./../models/employeeModel");
const AppError = require("../utils/appError");
const StationModel = require("../models/stationModel");
const { Sequelize } = require("sequelize");
exports.getAllEmployees = catchAsync(async (req, res, next) => {
	try {
		const employees = await EmployeeModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
			],
		});
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
			raw: true,
		});
		employees.push({ id: 0, name: "غير محدد" });
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
		await EmployeeModel.create({
			name: req.body.name,
			station_id: req.body.station,
		});
		res.status(200).json({
			state: "success",
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
			{ name: req.body.name, station_id: req.body.station },
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
