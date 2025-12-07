const sequelize = require("./../connection");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");
const { Sequelize } = require("sequelize");

exports.addQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);
			const [day, month, year] = req.body.date.trim().split("/");
			const currDate = new Date(`${year}-${month}-${day}`);
			const nextDay = new Date(currDate);
			nextDay.setDate(currDate.getDate() + 1);

			const quantityDeduction = await QuantityDeductionModel.create(
				{
					movment_id: req.body.movmentId,
					date: currDate,
					station_id: +req.body.station,
					type: req.body.type,
					amount: req.body.amount,
					substance_id: req.body.substance,
					prev_value: req.body.prevValue,
					curr_value: req.body.currValue,
					price: req.body.price,
					store_id: req.body.store,
				},
				{ transaction: t, raw: true }
			);
			// const storesArr = req.body.stores.map((el) => {
			// 	return {
			// 		movment_id: req.body.movmentId,
			// 		station_id: +req.body.station,
			// 		price: el.price,
			// 		quantity_deduction_id: quantityDeduction.id,
			// 	};
			// });
			// await QuantityDeductionStoresMovmentsModel.bulkCreate(storesArr, {
			// 	transaction: t,
			// });
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAllQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const quantityDeduction = await QuantityDeductionModel.findAll({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
				include: [
					{
						model: StationModel,
						attributes: ["id", "name"],
					},
				],
				order: [["createdAt", "DESC"]],
				limit: +req.query.limit,
				offset: +req.query.limit * +req.query.page,
			});

			const total = await QuantityDeductionModel.count({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
			});

			res.status(200).json({
				state: "success",
				quantityDeduction,
				total,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(
				req.headers["x-year"],
				"quantity_deduction"
			);
			await QuantityDeductionModel.destroy({
				where: {
					id: req.params.id,
				},
				transaction: t,
			});
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
