const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Sequelize, Op } = require("sequelize");

const sequelize = require("../connection");
const { getModel } = require("../utils/modelSelect");

exports.getAllCreditSales = catchAsync(async (req, res, next) => {
	try {
		const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
		const StationModel = getModel(req.headers["x-year"], "station");
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const creditSales = await CreditSaleModel.findAll({
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
				{
					model: MovmentModel,
					attributes: ["date"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await CreditSaleModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});

		res.status(200).json({
			state: "success",
			creditSales,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getUnPaidCreditSalesByStationIdAndStoreIdAndClientId = catchAsync(
	async (req, res, next) => {
		const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");

		try {
			const creditSales = await CreditSaleModel.findAll({
				where: {
					station_id: req.params.stationId,
					store_id: req.params.storeId,
					client_id: req.params.clientId,
					isSettled: false,
				},
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
					{
						model: StoreModel,
						attributes: ["id"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id"],
							},
						],
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				state: "success",
				creditSales,
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.addCreditSalesSettlement = catchAsync(async (req, res, next) => {
	try {
		const CreditSaleSettlementModel = getModel(
			req.headers["x-year"],
			"credit_sale_settlement"
		);
		const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
		const OtherModel = getModel(req.headers["x-year"], "other");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);

		await req.db.transaction(async (t) => {
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
			const settlement = await CreditSaleSettlementModel.create(
				{
					date: req.body.date,
					amount: req.body.amount,
					station_id: req.body.station,
					client_id: req.body.client,
					store_id: req.body.store,
					type: req.body.type,
					operation_number: req.body.operationNumber,
				},
				{ transaction: t }
			);

			await CreditSaleModel.update(
				{
					isSettled: true,
					settlement_id: settlement.id,
				},
				{
					where: {
						id: { [Op.in]: req.body.items },
					},
					transaction: t,
				}
			);

			if (req.body.type === "خصم كمية") {
				await OtherModel.bulkCreate(
					req.body.itemsArr.map((el) => {
						return {
							station_id: req.body.station,
							movment_id: req.body.movment,
							shift_id: req.body.shift,
							store_id: req.body.selectedClientStore,
							amount: Math.ceil(el.newAmount),
							title: el.title,
							type: "settlement",
							price: el.realPrice,
							employee_id: "0",
							settlement_id: settlement.id,
						};
					}),
					{ transaction: t }
				);
			}
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAllCreditSalesSettlements = catchAsync(async (req, res, next) => {
	try {
		const CreditSaleSettlementModel = getModel(
			req.headers["x-year"],
			"credit_sale_settlement"
		);
		const StationModel = getModel(req.headers["x-year"], "station");
		const creditSalesSettlements = await CreditSaleSettlementModel.findAll({
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
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await CreditSaleSettlementModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});

		res.status(200).json({
			state: "success",
			creditSalesSettlements,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteCreditSalesSettlement = catchAsync(async (req, res, next) => {
	try {
		const CreditSaleSettlementModel = getModel(
			req.headers["x-year"],
			"credit_sale_settlement"
		);
		const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
		const OtherModel = getModel(req.headers["x-year"], "other");
		const stationsClosedMonthModel = getModel(
			req.headers["x-year"],
			"stations_closed_month"
		);
		const CreditSalesSettlement = await CreditSaleSettlementModel.findByPk(
			req.params.id,
			{ raw: true }
		);
		const operationDate = new Date(CreditSalesSettlement.date);
		const month = operationDate.getMonth() + 1; // 1-based month
		// Check if month is closed for this station
		const closedRecord = await stationsClosedMonthModel.findOne({
			where: {
				station_id: CreditSalesSettlement.station_id,
				month,
				isClosed: 1,
			},
		});
		if (closedRecord) {
			return next(new AppError("الشهر مغلق لهذه المحطة .", 403));
		}
		await req.db.transaction(async (t) => {
			await CreditSaleModel.update(
				{
					isSettled: false,
					settlement_id: null,
				},
				{
					where: {
						settlement_id: req.params.id,
					},
					transaction: t,
				}
			);
			await CreditSaleSettlementModel.destroy({
				where: {
					id: req.params.id,
				},
				transaction: t,
			});
			await OtherModel.destroy({
				where: {
					settlement_id: req.params.id,
				},
				transaction: t,
			});
		});

		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
