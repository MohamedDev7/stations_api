const catchAsync = require("../utils/catchAsync");
const { getModel } = require("../utils/modelSelect");
const AppError = require("../utils/appError");
const { Op, Sequelize, fn, col } = require("sequelize");

exports.getDispensersMovmentByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			await req.db.transaction(async (t) => {
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
						shift_id: +req.params.shift_id,
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
		const DispenserModel = getModel(req.headers["x-year"], "dispenser");
		const StationModel = getModel(req.headers["x-year"], "station");
		const TankModel = getModel(req.headers["x-year"], "tank");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		await req.db.transaction(async (t) => {
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
		await req.db.transaction(async (t) => {
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
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
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const DispenserWheelCounterMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_wheel_counter_movment"
			);
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);
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
			const shift = await MovmentsShiftsModel.findOne({
				where: { station_id: req.body.station_id, movment_id: prevMovment.id },
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
					shift_id: shift.id,
					tank_id: +req.body.tank,
					movment_id: prevMovment.id,
					dispenser_id: dispenser.id,
					station_id: req.body.station_id,
					price: substances.filter(
						(ele) => ele.substance_id === req.body.substance
					)[0].price,
					is_active: 0,
					employee_id: 0,
					state: "saved",
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
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			//check pendding Movment
			const checkPendingMovment = await MovmentModel.findOne({
				where: { station_id: +req.body.station_id, state: "pending" },
				order: [["createdAt", "DESC"]],
				transaction: t,
			});
			if (checkPendingMovment) {
				return next(new AppError("لم يتم تأكيد جميع الحركات السابقة", 500));
			}
			await DispenserModel.update(
				{ is_active: req.body.active },
				{
					where: { id: +req.params.id },
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
exports.getAnnualDispensersMovment = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const TankModel = getModel(req.headers["x-year"], "tank");
		const ShiftModel = getModel(req.headers["x-year"], "shift");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const DispenserModel = getModel(req.headers["x-year"], "dispenser");
		const DispenserMovmentModel = getModel(
			req.headers["x-year"],
			"dispenser_movment"
		);

		await req.db.transaction(async (t) => {
			// Get all dispensers for this station
			const dispensers = await DispenserModel.findAll({
				where: { station_id: req.params.station_id },
				raw: true,
			});
			const dispenserIds = dispensers.map((el) => el.id);

			// For each dispenser, get min/max movement by Movment.date, with tank & substance info
			const results = await Promise.all(
				dispenserIds.map(async (id) => {
					// Earliest movement
					const minMov = await DispenserMovmentModel.findOne({
						where: { dispenser_id: id },
						include: [
							{
								model: MovmentModel,
								attributes: ["date"], // Ensure association exists
							},
							{
								model: ShiftModel,
								attributes: ["number", "id"],
							},
							{
								model: DispenserModel,
								attributes: ["number"],
								include: [
									{
										model: TankModel,
										attributes: ["number"],
										include: [
											{
												model: SubstanceModel,
												attributes: ["name"],
											},
										],
									},
								],
							},
						],
						order: [
							[MovmentModel, "date", "ASC"], // secondary: by latest date if shifts are tied
							[ShiftModel, "number", "ASC"], // order by maximum shift number (first match)
						],
						transaction: t,
						raw: false,
					});

					// Latest movement
					const maxMov = await DispenserMovmentModel.findOne({
						where: { dispenser_id: id },
						include: [
							{
								model: MovmentModel,
								attributes: ["date"],
							},
							{
								model: ShiftModel,
								attributes: ["number", "id"],
							},
							{
								model: DispenserModel,
								attributes: ["number"],
								include: [
									{
										model: TankModel,
										attributes: ["number", "id"],
										include: [
											{
												model: SubstanceModel,
												attributes: ["name", "id"],
											},
										],
									},
								],
							},
						],
						order: [
							[MovmentModel, "date", "DESC"], // secondary: by latest date if shifts are tied
							[ShiftModel, "number", "DESC"], // order by maximum shift number (first match)
						],
						transaction: t,
						raw: false,
					});
					return {
						dispenser_id: id,
						min_date_movment: minMov,
						max_date_movment: maxMov,
					};
				})
			);

			res.status(200).json({
				state: "success",
				dispensersMovments: results,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
