const catchAsync = require("../utils/catchAsync");
const { Op } = require("sequelize");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

exports.getStoreByStationId = catchAsync(async (req, res, next) => {
	try {
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const stores = await StoreModel.findAll({
			where: {
				station_id: req.params.id,
			},
			include: [
				{
					model: SubstanceModel,
					attributes: ["id", "name"], // Specify the attributes you want to include
				},
			],
		});
		res.status(200).json({
			state: "success",
			stores,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStoreByStationIdAndClientId = catchAsync(async (req, res, next) => {
	try {
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const stores = await StoreModel.findAll({
			where: {
				station_id: req.params.station_id,
				client_id: req.params.client_id,
			},
			include: [
				{
					model: SubstanceModel,
					attributes: ["id", "name"], // Specify the attributes you want to include
				},
			],
		});
		res.status(200).json({
			state: "success",
			stores,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStoresMovmentByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const StoreModel = getModel(req.headers["x-year"], "store");
				const SubstanceModel = getModel(req.headers["x-year"], "substance");
				const StoreMovmentModel = getModel(
					req.headers["x-year"],
					"store_movment"
				);
				const QuantityDeductionModel = getModel(
					req.headers["x-year"],
					"quantity_deduction"
				);
				const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
				const StocktakingStoresMovmentsModel = getModel(
					req.headers["x-year"],
					"stocktaking_stores_movments"
				);

				const storesMovments = await StoreMovmentModel.findAll({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift_id,
					},
					attributes: [
						"id",
						"prev_value",
						"curr_value",
						"movment_id",
						"deficit",
					],
					include: [
						{
							model: StoreModel,
							attributes: ["id", "type", "name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name"],
								},
							],
						},
					],
				});

				const quantityDeduction = await QuantityDeductionModel.findAll({
					where: {
						movment_id: req.params.id,
					},
					transaction: t,
					raw: true,
				});

				const stocktaking = await StocktakingModel.findOne({
					where: {
						movment_id: req.params.id,
					},
					order: [["createdAt", "DESC"]],
					transaction: t,
					raw: true,
				});

				if (!!stocktaking) {
					const stocktakingStoresMovments =
						await StocktakingStoresMovmentsModel.findAll({
							where: {
								stocktaking_id: stocktaking.id,
							},
							transaction: t,
							raw: true,
						});
					storesMovments.forEach((el) => {
						const stocktakingData = stocktakingStoresMovments.filter(
							(ele) => ele.store_id === el.store.id
						)[0];
						if (stocktakingData) {
							el.deficit =
								stocktakingData.prev_value - stocktakingData.curr_value;
						}
						// const amount =
						// 	+quantityDeduction.filter(
						// 		(ele) => ele.store_id === el.store.id
						// 	)[0]?.amount || 0;
						// el.curr_value = el.curr_value - amount;
					});
				}

				if (quantityDeduction.length > 0) {
					storesMovments.forEach((el) => {
						const amount =
							+quantityDeduction.filter(
								(ele) => ele.store_id === el.store.id
							)[0]?.amount || 0;
						el.curr_value = el.curr_value - amount;
					});
				}

				res.status(200).json({
					state: "success",
					storesMovments,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);

exports.getAllstores = catchAsync(async (req, res, next) => {
	try {
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const StationModel = getModel(req.headers["x-year"], "station");
		const stores = await StoreModel.findAll({
			include: [
				{
					model: SubstanceModel,
					attributes: ["id", "name"],
				},
				{
					model: StationModel,
					attributes: ["id", "name"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});

		const total = await StoreModel.count();
		res.status(200).json({
			state: "success",
			stores,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addStore = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const StoreModel = getModel(req.headers["x-year"], "store");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);

			//check currMomvnet
			const currMomvnet = await MovmentModel.findOne({
				where: {
					station_id: req.body.station,
					date: req.body.date,
				},
				transaction: t,
			});

			if (currMomvnet) {
				return next(new AppError(`تم ادخال الحركة بتاريخ ${req.body.date}`));
			}
			//check prevMovment
			const currDate = new Date(req.body.date);
			const previousDay = new Date(currDate);
			previousDay.setDate(currDate.getDate() - 1);
			const prevMovment = await MovmentModel.findOne({
				where: {
					station_id: req.body.station,
					date: previousDay,
				},
				transaction: t,
			});
			if (!prevMovment) {
				return next(
					new AppError(
						`لم يتم ادخال حركة اليوم السابق بتاريخ ${
							previousDay.toISOString().split("T")[0]
						}`
					)
				);
			}
			//check prevMomvnet
			const checkPendingMovment = await MovmentModel.findAll({
				where: { station_id: +req.body.station, state: "pending" },
				transaction: t,
				raw: true,
			});

			if (checkPendingMovment.length > 0) {
				return next(new AppError("لم يتم تأكيد حركة اليوم السابق", 500));
			}
			const store = await StoreModel.create(
				{
					station_id: req.body.station,
					client_id: req.body.client,
					substance_id: req.body.substance,
					date: previousDay,
					name: req.body.name,
					is_active: 1,
					type: "مجنب",
				},
				{
					transaction: t,
				}
			);
			const shift = await MovmentsShiftsModel.findOne({
				where: { station_id: req.body.station, movment_id: prevMovment.id },
				transaction: t,
			});
			const substances = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: previousDay } }, // Start date is less than or equal to requestDate
						{ end_date: { [Op.gte]: previousDay } }, // End date is greater than or equal to requestDate
					],
				},
				raw: true,
			});

			await StoreMovmentModel.create(
				{
					prev_value: 0,
					curr_value: +req.body.amount,
					store_id: store.id,
					date: previousDay,
					shift_id: shift.id,
					movment_id: prevMovment.id,
					station_id: req.body.station,
					price: substances.filter(
						(ele) => ele.substance_id === +req.body.substance
					)[0].price,
					is_active: 0,
					deficit: 0,
					state: "saved",
				},
				{
					transaction: t,
				}
			);

			await IncomeModel.create(
				{
					amount: req.body.amount,
					substance_id: req.body.substance,
					station_id: req.body.station,
					store_id: store.id,
					shift_id: shift.id,
					doc_number: 0,
					doc_amount: req.body.amount,
					from: "",
					type: "initial",
					movment_id: prevMovment.id,
					truck_number: 1,
					truck_driver: "رصيد افتتاحي",
					price: substances.filter(
						(ele) => ele.substance_id === +req.body.substance
					)[0].price,
					price_movment_id: substances.filter(
						(ele) => ele.substance_id === +req.body.substance
					)[0].id,
					state: "approved",
				},
				{
					transaction: t,
				}
			);
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
