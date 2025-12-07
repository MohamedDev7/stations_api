const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const { Op } = require("sequelize");
const { getModel } = require("../utils/modelSelect");

exports.getShiftsByStationId = catchAsync(async (req, res, next) => {
	try {
		const ShiftModel = getModel(req.headers["x-year"], "shift");

		const shifts = await ShiftModel.findAll({
			where: {
				station_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			shifts,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getLastShiftIdByMovmentId = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const MovmentsShiftsModel = getModel(
			req.headers["x-year"],
			"movments_shift"
		);
		const movment = await MovmentModel.findByPk(+req.params.id);
		const lastShift = await MovmentsShiftsModel.findOne({
			where: {
				movment_id: req.params.id,
				number: movment.shifts,
			},
		});

		res.status(200).json({
			state: "success",
			lastShift,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getMovmentsShiftsByMovmentId = catchAsync(async (req, res, next) => {
	try {
		const MovmentsShiftsModel = getModel(
			req.headers["x-year"],
			"movments_shift"
		);
		const shifts = await MovmentsShiftsModel.findAll({
			where: {
				movment_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			shifts,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteShiftBYMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);

			const BranchWithdrawalsModel = getModel(
				req.headers["x-year"],
				"branch_withdrawals"
			);
			const OtherModel = getModel(req.headers["x-year"], "other");

			await req.db.transaction(async (t) => {
				//check no shifts after
				const movment = await MovmentModel.findByPk(req.params.id, {
					raw: true,
				});
				const check1 = await MovmentModel.findAll({
					where: {
						station_id: movment.station_id,
						date: {
							[Op.gt]: movment.date,
						},
					},
				});
				const currShift = MovmentsShiftsModel.findByPk(+req.params.shift);
				const check2 = await MovmentsShiftsModel.findAll({
					where: {
						movment_id: req.params.id,
						number: {
							[Op.gt]: currShift.number,
						},
					},
					transaction: t,
				});

				if (check1.length > 0 || check2.length > 0) {
					return next(new AppError("لا يمكن حذف هذه المناوبة", 500));
				}

				await MovmentsShiftsModel.update(
					{ state: "inserted" },
					{
						where: {
							id: req.params.shift,
						},
						transaction: t,
					}
				);
				await StoreMovmentModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				await DispenserMovmentModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				// await IncomeModel.destroy({
				// 	where: {
				// 		movment: req.params.id,
				// 		shift_number: req.params.shift,
				// 	},
				// 	transaction: t,
				// });
				await BranchWithdrawalsModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
					},
					transaction: t,
				});
				await OtherModel.destroy({
					where: {
						movment_id: +req.params.id,
						shift_id: +req.params.shift,
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
	}
);
exports.getShiftDataByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			await req.db.transaction(async (t) => {
				const DispenserModel = getModel(req.headers["x-year"], "dispenser");
				const TankModel = getModel(req.headers["x-year"], "tank");
				const SubstanceModel = getModel(req.headers["x-year"], "substance");
				const DispenserMovmentModel = getModel(
					req.headers["x-year"],
					"dispenser_movment"
				);
				const StoreModel = getModel(req.headers["x-year"], "store");
				const StoreMovmentModel = getModel(
					req.headers["x-year"],
					"store_movment"
				);
				const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
				const BranchWithdrawalsModel = getModel(
					req.headers["x-year"],
					"branch_withdrawals"
				);
				const OtherModel = getModel(req.headers["x-year"], "other");

				const dispensersMovment = await DispenserMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
					include: [
						{
							model: DispenserModel,
							attributes: ["id", "number"],
							include: [
								{
									model: TankModel,
									attributes: ["id"],
									include: [
										{
											model: SubstanceModel,
											attributes: ["id", "name"],
										},
									],
								},
							],
						},
					],

					transaction: t,
				});

				dispensersMovment.forEach((el) => {
					el.totalLiters = el.curr_A - el.prev_A + el.curr_B - el.prev_B;
				});

				const storesMovment = await StoreMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
					include: [
						{
							model: StoreModel,
							attributes: ["id", "name", "type"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name"],
								},
							],
						},
					],
					// raw: true,
					transaction: t,
				});
				// const incomes = await IncomeModel.findAll({
				// 	where: {
				// 		movment_id: req.params.id,
				// 		shift_number: req.params.shift,
				// 	},
				// 	include: [
				// 		{
				// 			model: StoreModel,
				// 			attributes: ["name"],
				// 			include: [
				// 				{
				// 					model: SubstanceModel,
				// 					attributes: ["name"],
				// 				},
				// 			],
				// 		},
				// 	],
				// 	transaction: t,
				// });
				const others = await OtherModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
					include: [
						{
							model: StoreModel,
							attributes: ["id", "name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name"],
								},
							],
						},
					],
					transaction: t,
				});
				const creditSales = await CreditSaleModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
					transaction: t,
				});
				const coupons = await BranchWithdrawalsModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: req.params.shift,
					},
					include: [
						{
							model: StoreModel,
							attributes: ["id", "name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name"],
								},
							],
						},
					],
					transaction: t,
				});

				res.status(200).json({
					state: "success",
					storesMovment,
					dispensersMovment,
					coupons,
					others,
					creditSales,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
