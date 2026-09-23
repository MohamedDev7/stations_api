const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Sequelize } = require("sequelize");
const { getModel } = require("../utils/modelSelect");

exports.getAllFinancialOperations = catchAsync(async (req, res, next) => {
	try {
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const StationModel = getModel(req.year, "station");
		const stations = req.query.stations
			? req.query.stations.split(",").filter((s) => s.length > 0)
			: [];
		const page = parseInt(req.query.page) || 0;
		const rowsPerPage = parseInt(req.query.rowsPerPage) || 5;
		const whereConditions = {
			station_id: {
				[Sequelize.Op.in]: stations.length > 0 ? stations : req.stations,
			},
		};
		if (
			req.query.startDate &&
			req.query.startDate !== "null" &&
			req.query.endDate &&
			req.query.endDate !== "null"
		) {
			whereConditions.date = {
				[Sequelize.Op.between]: [req.query.startDate, req.query.endDate],
			};
		} else if (req.query.startDate && req.query.startDate !== "null") {
			whereConditions.date = {
				[Sequelize.Op.gte]: req.query.startDate,
			};
		} else if (req.query.endDate && req.query.endDate !== "null") {
			whereConditions.date = {
				[Sequelize.Op.lte]: req.query.endDate,
			};
		}
		const financialOperations = await FinancialOperationsModel.findAll({
			where: whereConditions,
			include: [{ model: StationModel, attributes: ["name"] }],
			order: [["date", "DESC"]],
			limit: rowsPerPage,
			offset: rowsPerPage * page,
		});
		const total = await FinancialOperationsModel.count({
			where: whereConditions,
		});

		res.status(200).json({
			state: "success",
			financialOperations,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getFinancialOperation = catchAsync(async (req, res, next) => {
	try {
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const financialOperation = await FinancialOperationsModel.findByPk(
			req.params.id,
		);
		res.status(200).json({
			state: "success",
			financialOperation,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.addFinancialOperation = catchAsync(async (req, res, next) => {
	try {
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const stationsClosedMonthModel = getModel(
			req.year,
			"stations_closed_month",
		);
		const operationDate = new Date(req.body.date);
		const month = operationDate.getMonth() + 1; // 1-based month
		// Check if month is closed for this station
		const closedRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: req.body.station,
				month,
				isClosed: 1,
			},
		});

		if (closedRecord) {
			return next(
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن إضافة عملية.", 403),
			);
		}
		await FinancialOperationsModel.create({
			station_id: req.body.station,
			debtor: req.body.debtor,
			creditor: req.body.creditor,
			date: req.body.date,
			statement: req.body.statement,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateFinancialOperation = catchAsync(async (req, res, next) => {
	try {
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const stationsClosedMonthModel = getModel(
			req.year,
			"stations_closed_month",
		);
		const financialOperation = await FinancialOperationsModel.findByPk(
			req.params.id,
			{ raw: true },
		);
		const oldOperationDate = new Date(financialOperation.date);
		const oldMonth = oldOperationDate.getMonth() + 1;
		const newOperationDate = new Date(req.body.date);
		const newMonth = newOperationDate.getMonth() + 1;
		// Check if month is closed for this station
		const oldRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: req.body.station,
				month: oldMonth,
				isClosed: 1,
			},
		});
		const newRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: req.body.station,
				month: newMonth,
				isClosed: 1,
			},
		});

		if (oldRecord || newRecord) {
			return next(
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن تعديل العملية.", 403),
			);
		}
		await FinancialOperationsModel.update(
			{
				station_id: req.body.station,
				debtor: req.body.debtor,
				creditor: req.body.creditor,
				date: req.body.date,
				statement: req.body.statement,
			},
			{
				where: { id: req.params.id },
			},
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.deleteFinancialOperation = catchAsync(async (req, res, next) => {
	try {
		const FinancialOperationsModel = getModel(req.year, "financial_operations");
		const stationsClosedMonthModel = getModel(
			req.year,
			"stations_closed_month",
		);
		const financialOperation = await FinancialOperationsModel.findByPk(
			req.params.id,
			{ raw: true },
		);
		const operationDate = new Date(financialOperation.date);
		const month = operationDate.getMonth() + 1; // 1-based month
		// Check if month is closed for this station
		const closedRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: financialOperation.station_id,
				month,
				isClosed: 1,
			},
		});
		if (closedRecord) {
			return next(
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن حذف العملية.", 403),
			);
		}
		await FinancialOperationsModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
