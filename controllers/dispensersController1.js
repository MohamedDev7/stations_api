const catchAsync = require("../utils/catchAsync");
const DispenserMovmentModel = require("./../models/dispenserMovmentModel");
const MovmentModel = require("./../models/movmentModel");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const TankModel = require("../models/tankModel");
const DispenserModel = require("../models/dispenserModel");
const ShiftModel = require("../models/shiftModel");
const SubstanceModel = require("../models/substanceModel");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const StationModel = require("../models/stationModel");
const { Op, Sequelize } = require("sequelize");
const DispenserWheelCounterMovmentModel = require("../models/dispenserWheelCounterMovmentModel");

exports.getDispensersMovmentByMovmentIdAndShiftNumber = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
				const movment = await MovmentModel.findOne({
					where: {
						id: +req.params.id,
					},
				});
				const dispensers = await DispenserModel.findAll({
					where: {
						station_id: movment.station_id,
						is_active: 1,
					},
					attributes: ["id"],
					raw: true,
				});

				const dispensersArr = dispensers.map((el) => el.id);

				const dispensersMovments = await DispenserMovmentModel.findAll({
					where: {
						movment_id: +req.params.id,
						shift_number: +req.params.shiftNumber,
						dispenser_id: {
							[Sequelize.Op.in]: dispensersArr,
						},
					},
					attributes: [
						"id",
						"curr_A",
						"curr_B",
						"movment_id",
						"prev_A",
						"prev_B",
					],
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
					order: [[{ model: DispenserModel }, "number", "ASC"]],
				});
				res.status(200).json({
					state: "success",
					dispensersMovments,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.getAllDispensers = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const dispensers = await DispenserModel.findAll({
				include: [
					{
						model: TankModel,
						attributes: ["id"],
						include: [{ model: SubstanceModel, attributes: ["id", "name"] }],
					},
					{
						model: StationModel,
						attributes: ["id", "name"],
					},
				],
			});

			res.status(200).json({
				state: "success",
				dispensers,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getDispensersByStationId = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const dispensers = await DispenserModel.findAll({
				where: { station_id: req.params.id, is_active: 1 },
				include: [
					{
						model: TankModel,
						attributes: ["id"],
						include: [{ model: SubstanceModel, attributes: ["id", "name"] }],
					},
				],
			});

			res.status(200).json({
				state: "success",
				dispensers,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addDispenser = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			//check currMomvnet
			const currMomvnet = await MovmentModel.findOne({
				where: {
					station_id: req.body.station_id,
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
					station_id: req.body.station_id,
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
			const checkPendingMovment = await MovmentModel.findOne({
				where: { station_id: +req.body.station_id, state: "pending" },
				order: [["createdAt", "DESC"]],
				transaction: t,
			});

			if (checkPendingMovment) {
				return next(new AppError("لم يتم تأكيد حركة اليوم السابق", 500));
			}

			const dispenser = await DispenserModel.create(
				{
					station_id: req.body.station_id,
					number: req.body.number,
					tank_id: req.body.tank,
					A: req.body.A,
					B: req.body.B,
					wheel_counter_A: req.body.wheelCounterA,
					wheel_counter_B: req.body.wheelCounterA,
					is_active: 1,
				},
				{
					transaction: t,
				}
			);
			const shift = await ShiftModel.findOne({
				where: { station_id: req.body.station_id, number: prevMovment.shifts },
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
			await DispenserMovmentModel.create(
				{
					prev_A: +req.body.A,
					prev_B: +req.body.B,
					curr_A: +req.body.A,
					curr_B: +req.body.B,
					start: shift.start,
					end: shift.end,
					shift_number: prevMovment.shifts,
					tank_id: +req.body.tank,
					movment_id: prevMovment.id,
					dispenser_id: dispenser.id,
					station_id: req.body.station_id,
					price: substances.filter(
						(ele) => ele.substance_id === req.body.substance
					)[0].price,
					is_active: 0,
				},
				{
					transaction: t,
				}
			);

			await DispenserWheelCounterMovmentModel.create(
				{
					prev_A: +req.body.A,
					prev_B: +req.body.B,
					curr_A: +req.body.A,
					curr_B: +req.body.B,
					movment_id: prevMovment.id,
					dispenser_id: dispenser.id,
					station_id: req.body.station_id,
				},
				{
					transaction: t,
				}
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.updateDispenserState = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			//check pendding Movment
			const checkPendingMovment = await MovmentModel.findOne({
				where: { station_id: +req.body.station_id, state: "pending" },
				order: [["createdAt", "DESC"]],
				transaction: t,
			});
			if (checkPendingMovment) {
				return next(new AppError("لم يتم تأكيد جميع الحركات السابقة", 500));
			}
			if (req.body.active) {
				const lastMovment = await MovmentModel.findOne({
					where: {
						station_id: req.body.station_id,
						state: "approved",
					},
					order: [["date", "DESC"]], // order by date descending
					transaction: t,
					raw: true,
				});
				await DispenserModel.update(
					{ is_active: req.body.active },
					{
						where: { id: +req.params.id },
						transaction: t,
					}
				);
				const dispenser = await DispenserMovmentModel.findOne(
					{
						where: {
							shift_number: lastMovment.shifts,
							movment_id: lastMovment.id,
							dispenser_id: +req.params.id,
						},
					},
					{
						transaction: t,
					}
				);
				if (!dispenser) {
					await DispenserMovmentModel.create(
						{
							prev_A: +req.body.A,
							prev_B: +req.body.B,
							curr_A: +req.body.A,
							curr_B: +req.body.B,
							start: shift.start,
							end: shift.end,
							shift_number: prevMovment.shifts,
							tank_id: +req.body.tank,
							movment_id: prevMovment.id,
							dispenser_id: dispenser.id,
							station_id: req.body.station_id,
							price: substances.filter(
								(ele) => ele.substance_id === req.body.substance
							)[0].price,
							is_active: 0,
						},
						{
							transaction: t,
						}
					);
				}
			} else {
				await DispenserModel.update(
					{ is_active: req.body.active },
					{
						where: { id: +req.params.id },
						transaction: t,
					}
				);
			}
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
