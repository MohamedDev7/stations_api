const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Sequelize } = require("sequelize");
const { getModel } = require("../utils/modelSelect");

exports.getAllDeposits = catchAsync(async (req, res, next) => {
	try {
		const DepositModel = getModel(req.headers["x-year"], "deposit");
		const StationModel = getModel(req.headers["x-year"], "station");
		const BankModel = getModel(req.headers["x-year"], "bank");
		const stations = req.query.stations
			? req.query.stations.split(",").filter((s) => s.length > 0)
			: [];
		const whereConditions = {
			station_id: {
				[Sequelize.Op.in]: stations.length > 0 ? stations : req.stations,
			},
		};
		const movmentWhereConditions = {};
		if (
			req.query.startDate &&
			req.query.startDate !== "null" &&
			req.query.endDate &&
			req.query.endDate !== "null"
		) {
			movmentWhereConditions.date = {
				[Sequelize.Op.between]: [req.query.startDate, req.query.endDate],
			};
		} else if (req.query.startDate && req.query.startDate !== "null") {
			movmentWhereConditions.date = {
				[Sequelize.Op.gte]: req.query.startDate,
			};
		} else if (req.query.endDate && req.query.endDate !== "null") {
			movmentWhereConditions.date = {
				[Sequelize.Op.lte]: req.query.endDate,
			};
		}
		const deposits = await DepositModel.findAll({
			where: whereConditions,
			include: [
				{ model: StationModel, attributes: ["name"] },
				{ model: BankModel, attributes: ["name"] },
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await DepositModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		res.status(200).json({
			state: "success",
			deposits,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getDeposit = catchAsync(async (req, res, next) => {
	try {
		const DepositModel = getModel(req.headers["x-year"], "deposit");
		const deposit = await DepositModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			deposit,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addDeposits = catchAsync(async (req, res, next) => {
	try {
		const DepositModel = getModel(req.headers["x-year"], "deposit");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
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
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن إضافة إيداع.", 403)
			);
		}
		await DepositModel.create({
			station_id: req.body.station,
			amount: req.body.amount,
			bank_id: req.body.bank,
			invoice_date: req.body.invoiceDate,
			number: req.body.number,
			statement: req.body.statement,
			user_id: req.user.id,
			date: req.body.date,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteDeposit = catchAsync(async (req, res, next) => {
	try {
		const DepositModel = getModel(req.headers["x-year"], "deposit");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);
		const deposit = await DepositModel.findByPk(req.params.id, { raw: true });
		const operationDate = new Date(deposit.date);
		const month = operationDate.getMonth() + 1; // 1-based month
		// Check if month is closed for this station
		const closedRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: deposit.station_id,
				month,
				isClosed: 1,
			},
		});
		if (closedRecord) {
			return next(
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن حذف الايداع.", 403)
			);
		}
		await DepositModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateDeposit = catchAsync(async (req, res, next) => {
	try {
		const DepositModel = getModel(req.headers["x-year"], "deposit");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);
		const deposit = await DepositModel.findByPk(req.params.id, { raw: true });
		const oldDoperationDate = new Date(deposit.date);
		const oldMonth = oldDoperationDate.getMonth() + 1;
		const newDperationDate = new Date(deposit.date);
		const newMonth = newDperationDate.getMonth() + 1;
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
				new AppError("الشهر مغلق لهذه المحطة، لا يمكن تعديل الايداع.", 403)
			);
		}
		await DepositModel.update(
			{
				station_id: req.body.station,
				amount: req.body.amount,
				bank_id: req.body.bank,
				invoice_date: req.body.invoiceDate,
				number: req.body.number,
				statement: req.body.statement,
				user_id: req.user.id,
				date: req.body.date,
			},
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
