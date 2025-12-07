const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");
const { Sequelize } = require("sequelize");
exports.getAllEmployees = catchAsync(async (req, res, next) => {
	try {
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
		const StationModel = getModel(req.headers["x-year"], "station");
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
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
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
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
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
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
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
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
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
		const EmployeeModel = getModel(req.headers["x-year"], "employee");
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
