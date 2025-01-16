const catchAsync = require("../utils/catchAsync");
const IncomeModel = require("./../models/incomeModel");
const AppError = require("../utils/appError");
const StoreMovmentModel = require("../models/storeMovmentModel");
const sequelize = require("./../connection");
const TankMovmentModel = require("../models/tankMovmentModel");
// exports.getAllSubstances = catchAsync(async (req, res, next) => {
// 	try {
// 		const substances = await SubstanceModel.findAll();
// 		res.status(200).json({
// 			state: "success",
// 			substances,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
// exports.getSubstance = catchAsync(async (req, res, next) => {
// 	try {
// 		const substance = await SubstanceModel.findByPk(req.params.id);
// 		res.status(200).json({
// 			state: "success",
// 			substance,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.addIncome = catchAsync(async (req, res, next) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const income = await IncomeModel.create(
				{
					amount: +req.body.amount,
					substance_id: +req.body.substance,
					shift_number: +req.body.shift,
					date: req.body.date,
					store_id: +req.body.store,
					tank_id: +req.body.tank,
					employee_id: +req.body.employee,
					station_id: +req.body.station,
					truck_number: req.body.truckNumber,
					truck_driver: req.body.truckDriver,
					start: req.body.start,
					end: req.body.end,
				},
				{ transaction: t }
			);
			const lastStoreMovment = await StoreMovmentModel.findOne({
				where: { store_id: +req.body.store },
				order: [["createdAt", "DESC"]],
				transaction: t,
			});
			await StoreMovmentModel.create(
				{
					prev_value: lastStoreMovment.curr_value,
					curr_value: lastStoreMovment.curr_value + +req.body.amount,
					date: req.body.date,
					store_id: +req.body.store,
					station_id: +req.body.station,
					shift_number: +req.body.shift,
					substance_id: +req.body.substance,
					start: req.body.start,
					end: req.body.end,
					movment_id: req.body.movmentId,
				},
				{ transaction: t }
			);
			const lastTankMovment = await TankMovmentModel.findOne({
				where: { tank_id: +req.body.tank },
				order: [["createdAt", "DESC"]],
				transaction: t,
			});
			await TankMovmentModel.create(
				{
					prev_value: lastTankMovment.curr_value,
					curr_value: lastTankMovment.curr_value + +req.body.amount,
					date: req.body.date,
					tank_id: +req.body.tank,
					station_id: +req.body.station,
				},
				{ transaction: t }
			);
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
// exports.deleteSubstance = catchAsync(async (req, res, next) => {
// 	try {
// 		await SubstanceModel.destroy({
// 			where: { id: req.params.id },
// 		});
// 		res.status(200).json({
// 			state: "success",
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });

// exports.updateSubstance = catchAsync(async (req, res, next) => {
// 	try {
// 		await SubstanceModel.update(
// 			{ name: req.body.name, price: req.body.price },
// 			{
// 				where: { id: req.params.id },
// 			}
// 		);
// 		res.status(200).json({
// 			state: "success",
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
