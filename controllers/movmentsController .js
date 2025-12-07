const catchAsync = require("../utils/catchAsync");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const { Sequelize, Op, where } = require("sequelize");
const { getModel } = require("../utils/modelSelect");
const notificationQueue = require("../queues/notificationQueue");

exports.getAllMovments = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const StationModel = getModel(req.headers["x-year"], "station");
		const MovmentsShiftsModel = getModel(
			req.headers["x-year"],
			"movments_shift"
		);
		const stations = req.query.stations
			? req.query.stations.split(",").filter((s) => s.length > 0)
			: [];
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

		const movments = await MovmentModel.findAll({
			where: whereConditions,
			raw: true,
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
		const movmentsIds = movments.map((el) => el.id);
		const movmentsTotal = await MovmentModel.findAll({
			where: whereConditions,
		});
		// const dispensersMovments = await DispenserMovmentModel.findAll({
		// 	where: {
		// 		movment_id: {
		// 			[Sequelize.Op.in]: movmentsIds,
		// 		},
		// 	},
		// });
		const shifts = await MovmentsShiftsModel.findAll({
			where: {
				movment_id: {
					[Sequelize.Op.in]: movmentsIds,
				},
			},
			raw: true,
		});
		movments.forEach((el) => {
			el.insertedShifts = shifts.filter((ele) => ele.movment_id === el.id);
		});
		// const groupedData = shifts.reduce((acc, item) => {
		// 	const key = item.movment_id;
		// 	if (!acc[key]) {
		// 		acc[key] = []; // Use an array instead of Set
		// 	}

		// 	// Check if the shift_number already exists in the array for the current key
		// 	const exists = acc[key].some(
		// 		(entry) => entry.shift_number === item.shift_number
		// 	);

		// 	if (!exists) {
		// 		// Add the object only if the shift_number is not already in the array
		// 		acc[key].push({ shift_number: item.shift_number, state: item.state });
		// 	}

		// 	return acc;
		// }, {});

		// const transformedData = Object.keys(groupedData).map((key) => {
		// 	return {
		// 		movment_id: parseInt(key),
		// 		shifts: Array.from(groupedData[key]),
		// 	};
		// });
		// const movmentAr = movments.map((el) => {
		// 	return {
		// 		...el,
		// 		insertedShifts:
		// 			transformedData.filter((ele) => ele.movment_id === el.id)[0]
		// 				?.shifts || [],
		// 	};
		// });

		res.status(200).json({
			state: "success",
			movments,
			total: movmentsTotal.length,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getOthersByMovmentIdAndShiftId = catchAsync(async (req, res, next) => {
	try {
		const OtherModel = getModel(req.headers["x-year"], "other");
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const others = await OtherModel.findAll({
			where: {
				movment_id: req.params.movment_id,
				shift_id: req.params.shift_id,
			},
			include: [
				{
					model: StoreModel,
					attributes: ["name", "id"],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id", "name"],
						},
					],
				},
			],
		});
		res.status(200).json({
			state: "success",
			others,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getMovmentsByStationId = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const movments = await MovmentModel.findAll({
			where: {
				station_id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
			movments,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStationMovment = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		await req.db.transaction(async (t) => {
			const movment = await MovmentModel.findOne({
				where: {
					station_id: +req.params.station_id,
					number: +req.params.movment_number,
				},
				order: [["createdAt", "DESC"]],
				transaction: t,
			});

			res.status(200).json({
				state: "success",
				movment,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStationMovmentByDate = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const MovmentsShiftsModel = getModel(
			req.headers["x-year"],
			"movments_shift"
		);
		await req.db.transaction(async (t) => {
			const movment = await MovmentModel.findOne({
				where: {
					station_id: +req.params.id,
					date: req.params.date,
					state: "approved",
				},
				order: [["createdAt", "DESC"]],
				raw: true,
				transaction: t,
			});
			let lastShift;
			if (movment) {
				lastShift = await MovmentsShiftsModel.findOne({
					where: {
						station_id: +req.params.id,
						movment_id: movment.id,
						state: "saved",
					},
					order: [["number", "DESC"]],
					transaction: t,
				});
			}
			res.status(200).json({
				state: "success",
				movment: { ...movment, lastShift },
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStationPendingMovment = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const pendingMovment = await MovmentModel.findAll({
			where: { station_id: +req.params.id, state: "pending" },
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({
			state: "success",
			pendingMovment,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addMovment = catchAsync(async (req, res, next) => {
	const currDate = new Date(req.body.date);
	const previousDay = new Date(currDate);
	previousDay.setDate(currDate.getDate() - 1);
	try {
		await req.db.transaction(async (t) => {
			const StationModel = getModel(req.headers["x-year"], "station");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);
			const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
			const ShiftModel = getModel(req.headers["x-year"], "shift");
			const SurplusModel = getModel(req.headers["x-year"], "surplus");

			const station = await StationModel.findOne({
				where: {
					id: req.body.station_id,
				},
			});

			//check currMomvnet
			const currMomvnet = await MovmentModel.findOne({
				where: {
					station_id: req.body.station_id,
					date: req.body.date,
				},
			});
			if (currMomvnet) {
				return next(new AppError(`تم ادخال الحركة بتاريخ ${req.body.date}`));
			}
			//check prevMomvnet
			const checkPendingMovment = await MovmentModel.findOne({
				where: { station_id: +req.body.station_id, state: "pending" },
				order: [["createdAt", "DESC"]],
			});

			if (checkPendingMovment) {
				return next(new AppError("لم يتم تأكيد حركة اليوم السابق", 500));
			}

			const prevMovment = await MovmentModel.findOne({
				where: {
					station_id: req.body.station_id,
					date: previousDay,
					state: "approved",
				},
				order: [["createdAt", "DESC"]],
			});

			if (!prevMovment) {
				return next(new AppError("لم يتم ادخال حركة اليوم السابق", 500));
			}

			//check price movment stocktaking
			const priceMovment = await SubstancePriceMovmentModel.findAll({
				where: {
					start_date: req.body.date,
					type: "تحريك تسعيرة",
				},
				raw: true,
			});

			if (priceMovment.length > 0) {
				// Check if each price movement has a stocktaking
				for (const movement of priceMovment) {
					const hasStocktaking = await StocktakingModel.findOne({
						where: {
							substance_id: movement.substance_id,
							date: previousDay,
							station_id: req.body.station_id,
							type: "تسعيرة",
							prev_price: movement.prev_price,
							curr_price: movement.price,
						},
					});
					if (!hasStocktaking) {
						return next(
							new AppError(
								`لم يتم إجراء جرد بتاريخ ${
									previousDay.toISOString().split("T")[0]
								} عند تغير السعر من ${movement.prev_price} إلى ${
									movement.price
								}`,
								500
							)
						);
					}
				}
			}

			const movment = await MovmentModel.create(
				{
					station_id: req.body.station_id,
					date: req.body.date,
					number: req.body.number,
					shifts: station.shifts,
					state: "pending",
					has_stocktaking: 0,
				},
				{ transaction: t, raw: true }
			);

			const shifts = ShiftModel.findAll({
				where: { station_id: req.body.station_id },
				raw: true,
			});
			const shiftsArr = (await shifts).map((el) => {
				return {
					station_id: req.body.station_id,
					movment_id: movment.id,
					number: el.number,
					start: el.start,
					end: el.end,
					state: "inserted",
				};
			});
			const shiftss = await MovmentsShiftsModel.bulkCreate(shiftsArr, {
				transaction: t,
			});

			//link stocktacking surplus if exists
			const surplus = await SurplusModel.findAll({
				where: {
					station_id: req.body.station_id,
					date: currDate,
					movment_id: null,
					shift_id: null,
				},
				raw: true,
			});

			if (surplus.length > 0) {
				await SurplusModel.update(
					{
						movment_id: movment.id,
					},
					{
						where: {
							id: {
								[Op.in]: surplus.map((el) => el.id),
							},
						},
						transaction: t,
					}
				);
			}

			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.addShiftMovment = catchAsync(async (req, res, next) => {
	try {
		const MovmentsShiftsModel = getModel(
			req.headers["x-year"],
			"movments_shift"
		);
		await req.db.transaction(async (t) => {
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const OtherModel = getModel(req.headers["x-year"], "other");

			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			const dispensersMovmentsArr = req.body.dispensers.map((el) => {
				return {
					prev_A: +el.prev_A,
					prev_B: +el.prev_B,
					curr_A: +el.curr_A,
					curr_B: +el.curr_B,
					shift_id: req.body.shift.id,
					tank_id: el.dispenser.tank.id,
					dispenser_id: +el.dispenser.id,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					price: el.dispenser.tank.substance.price,
					is_active: 1,
					employee_id: el.employee_id,
					state: req.body.state,
				};
			});

			await DispenserMovmentModel.bulkCreate(dispensersMovmentsArr, {
				transaction: t,
			});
			const storesMovmentsArr = req.body.currStoresMovments.map((el) => {
				return {
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					store_id: el.store.id,
					date: req.body.date,
					shift_id: req.body.shift.id,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					price: el.store.substance.price,
					state: req.body.state,
					deficit: el.deficit,
				};
			});

			const storesMovments = await StoreMovmentModel.bulkCreate(
				storesMovmentsArr,
				{ transaction: t }
			);

			const othersArr = req.body.others.map((el) => {
				return {
					store_id: el.store,
					movment_id: +req.body.movment_id,
					station_id: +req.body.station_id,
					amount: el.amount,
					title: el.title,
					shift_id: req.body.shift.id,
					type: el.type,
					price: el.substance.price,
					employee_id: el.employee_id,
				};
			});
			await OtherModel.bulkCreate(othersArr, { transaction: t });

			const creditSalesArr = req.body.creditSales.map((el) => {
				return {
					station_id: +req.body.station_id,
					movment_id: +req.body.movment_id,
					shift_id: req.body.shift.id,
					store_id: +el.store,
					client_id: +el.client,
					amount: el.amount,
					title: el.title,
					price: el.substance.price,
					employee_id: el.employee_id,
				};
			});

			await CreditSaleModel.bulkCreate(creditSalesArr, { transaction: t });

			// const branchWithdrawalsArr = req.body.coupons.map((el) => {
			// 	return {
			// 		station_id: +req.body.station_id,
			// 		movment_id: +req.body.movment_id,
			// 		shift_id: req.body.shift.id,
			// 		store_id: el.store,
			// 		store_movment_id: storesMovments.filter(
			// 			(ele) => ele.store_id === el.store
			// 		)[0].id,
			// 		amount: +el.amount,
			// 		type: el.type,
			// 		shift_id: req.body.shift.id,
			// 		price: el.substance.price,
			// 		employee_id: el.employee_id,
			// 	};
			// });
			// await BranchWithdrawalsModel.bulkCreate(branchWithdrawalsArr, {
			// 	transaction: t,
			// });
			//update movment shift state
		});
		await MovmentsShiftsModel.update(
			{ state: req.body.state },
			{ where: { id: req.body.shift.id } }
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.editShiftMovment = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const OtherModel = getModel(req.headers["x-year"], "other");
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");
			const currDate = new Date(req.body.date);
			const nextDay = new Date(req.body.date);
			nextDay.setDate(currDate.getDate() + 1);
			//update despensers
			//update curr shift
			for (const { id, curr_A, curr_B, price, employee_id } of req.body
				.dispensers) {
				await DispenserMovmentModel.update(
					{
						curr_A: curr_A,
						curr_B: curr_B,
						price: price,
						employee_id: employee_id,
						state: req.body.state,
					},
					{
						where: { id: id },
						transaction: t, // Condition to match the record by 'id'
					}
				);
			}

			//get next shift
			const currMovment = await MovmentModel.findByPk(req.body.movment_id, {
				raw: true,
			});

			if (currMovment.shifts > req.body.shift.number) {
				for (const { curr_A, curr_B, dispenser } of req.body.dispensers) {
					const { id } = dispenser;
					const nextShift = await MovmentsShiftsModel.findOne({
						where: {
							movment_id: currMovment.id,
							number: req.body.shift.number + 1,
							station_id: req.body.station_id,
						},
						raw: true,
					});
					await DispenserMovmentModel.update(
						{
							prev_A: curr_A,
							prev_B: curr_B,
						},
						{
							where: {
								dispenser_id: id,
								shift_id: nextShift.id,
								movment_id: req.body.movment_id,
							},
							transaction: t,
						}
					);
				}
			} else {
				const nextMovment = await MovmentModel.findOne({
					where: { date: nextDay, station_id: req.body.station_id },
					raw: true,
				});
				if (nextMovment) {
					for (const { curr_A, curr_B, dispenser } of req.body.dispensers) {
						const { id } = dispenser;
						const nextShift = await MovmentsShiftsModel.findOne({
							where: {
								movment_id: nextMovment.id,
								number: 1,
							},
							raw: true,
						});
						await DispenserMovmentModel.update(
							{
								prev_A: curr_A,
								prev_B: curr_B,
							},
							{
								where: {
									dispenser_id: id,
									shift_id: nextShift.id,
									movment_id: nextMovment.id,
								},
								transaction: t,
							}
						);
					}
				}
			}

			//update stores
			//update curr shift
			for (const { id, curr_value, price } of req.body.currStoresMovments) {
				await StoreMovmentModel.update(
					{
						curr_value: curr_value,
						price: price,
						state: req.body.state,
					},
					{
						where: { id: id },
						transaction: t, // Condition to match the record by 'id'
					}
				);
			}

			//update next shifts
			const nextMovments = await MovmentModel.findAll({
				where: {
					station_id: req.body.station_id,
					date: {
						[Op.gt]: currDate, // Find all records where the date is greater than currDate
					},
				},
				attributes: ["id"], // Only select the 'id' field
				raw: true, // Return raw data (plain object)
			});

			if (currMovment.shifts > req.body.shift.number) {
				for (const { old_curr_value, curr_value, store_id } of req.body
					.currStoresMovments) {
					const diff = curr_value - old_curr_value;
					const nextShifts = await MovmentsShiftsModel.findAll({
						where: {
							movment_id: currMovment.id,
							number: {
								[Op.gt]: req.body.shift.number,
							},
						},
						raw: true,
					});
					const shiftsIds = nextShifts.map((el) => el.id);
					await StoreMovmentModel.update(
						{
							prev_value: req.db.literal(`prev_value + ${diff}`),
							curr_value: req.db.literal(`curr_value + ${diff}`),
						},
						{
							where: {
								store_id: store_id,
								shift_id: {
									[Op.in]: shiftsIds,
								},
								movment_id: req.body.movment_id,
							},
							transaction: t,
						}
					);
				}
			}

			if (nextMovments.length > 0) {
				const nextMovmentsIds = nextMovments.map((el) => el.id);
				for (const { old_curr_value, curr_value, store_id } of req.body
					.currStoresMovments) {
					const diff = curr_value - old_curr_value;
					await StoreMovmentModel.update(
						{
							prev_value: req.db.literal(`prev_value + ${diff}`),
							curr_value: req.db.literal(`curr_value + ${diff}`),
						},
						{
							where: {
								store_id: store_id,
								movment_id: {
									[Op.in]: nextMovmentsIds,
								},
							},
							transaction: t,
						}
					);
				}
			}

			//updating others
			let othersToAdd = [];
			let othersToEdit = [];
			let othersToDelete = [];
			req.body.others.forEach((el) => {
				if (el.db_id) {
					othersToEdit.push({
						store_id: el.store,
						store_movment_id: req.body.currStoresMovments.filter(
							(ele) => ele.store_id === el.store
						)[0].id,
						amount: +el.amount,
						type: el.type,
						price: el.price,
						title: el.title,
						employee_id: el.employee_id,
						db_id: el.db_id,
					});
				}
				if (!el.db_id) {
					othersToAdd.push({
						station_id: +req.body.station_id,
						movment_id: +req.body.movment_id,
						shift_id: req.body.shift.id,
						store_id: el.store,
						store_movment_id: req.body.currStoresMovments.filter(
							(ele) => ele.store_id === el.store
						)[0].id,
						amount: +el.amount,
						type: el.type,
						title: el.title,

						price: el.substance.price,
						employee_id: el.employee_id,
					});
				}
			});

			const dbOthers = await OtherModel.findAll({
				where: {
					movment_id: req.body.movment_id,
					shift_id: req.body.shift.id,
				},
				raw: true,
			});

			othersToDelete = dbOthers.filter(
				(dbOther) =>
					!req.body.others
						.filter((el) => el.db_id)
						.some((reqOther) => reqOther.db_id === dbOther.id)
			);
			const othersToDeleteIds = othersToDelete.map((el) => el.id);
			const updateOthersPromises = othersToEdit.map((el) => {
				return OtherModel.update(el, {
					where: { id: el.db_id },
					transaction: t,
				});
			});
			await Promise.all(updateOthersPromises);

			await OtherModel.destroy({
				where: {
					id: {
						[Op.in]: othersToDeleteIds,
					},
				},
				transaction: t,
			});

			await OtherModel.bulkCreate(othersToAdd, {
				transaction: t,
			});
			//updating credit sales
			let creditSalesToAdd = [];
			let creditSalesToEdit = [];
			let creditSalesToDelete = [];

			req.body.creditSales.forEach((el) => {
				if (el.db_id) {
					creditSalesToEdit.push({
						store_id: el.store,
						client_id: el.client,
						amount: +el.amount,
						price: el.price,
						title: el.title,
						db_id: el.db_id,
						employee_id: el.employee_id,
					});
				}

				if (!el.db_id) {
					creditSalesToAdd.push({
						station_id: +req.body.station_id,
						movment_id: +req.body.movment_id,
						shift_id: req.body.shift.id,
						store_id: el.store,
						client_id: el.client,
						amount: +el.amount,
						title: el.title,
						price: el.substance.price,
						employee_id: el.employee_id,
					});
				}
			});

			const dbCreditSales = await CreditSaleModel.findAll({
				where: {
					movment_id: req.body.movment_id,
					shift_id: req.body.shift.id,
				},
				raw: true,
			});

			creditSalesToDelete = dbCreditSales.filter(
				(dbCreditSale) =>
					!req.body.creditSales
						.filter((el) => el.db_id)
						.some((reqCreditSale) => reqCreditSale.db_id === dbCreditSale.id)
			);

			const creditSaleToDeleteIds = creditSalesToDelete.map((el) => el.id);

			const updateCreditSalesPromises = creditSalesToEdit.map((el) => {
				return CreditSaleModel.update(el, {
					where: { id: el.db_id },
					transaction: t,
				});
			});

			await Promise.all(updateCreditSalesPromises);

			await CreditSaleModel.destroy({
				where: {
					id: {
						[Op.in]: creditSaleToDeleteIds,
					},
				},
				transaction: t,
			});

			await CreditSaleModel.bulkCreate(creditSalesToAdd, {
				transaction: t,
			});
			// //updating coupons
			// let couponsToAdd = [];
			// let couponsToEdit = [];
			// let couponsToDelete = [];
			// req.body.coupons.forEach((el) => {
			// 	if (el.db_id) {
			// 		couponsToEdit.push({
			// 			station_id: +req.body.station_id,
			// 			movment_id: +req.body.movment_id,
			// 			store_id: el.store,
			// 			store_movment_id: req.body.currStoresMovments.filter(
			// 				(ele) => ele.store_id === el.store
			// 			)[0].id,
			// 			amount: +el.amount,
			// 			type: el.type,
			// 			price: el.price,
			// 			employee_id: el.employee_id,
			// 			db_id: el.db_id,
			// 		});
			// 	}
			// 	if (!el.db_id) {
			// 		couponsToAdd.push({
			// 			station_id: +req.body.station_id,
			// 			movment_id: +req.body.movment_id,
			// 			shift_id: req.body.shift.id,
			// 			store_id: el.store,
			// 			store_movment_id: req.body.currStoresMovments.filter(
			// 				(ele) => ele.store_id === el.store
			// 			)[0].id,
			// 			amount: +el.amount,
			// 			type: el.type,

			// 			price: el.substance.price,
			// 			employee_id: el.employee_id,
			// 		});
			// 	}
			// });

			// const dbCoupons = await BranchWithdrawalsModel.findAll({
			// 	where: {
			// 		movment_id: req.body.movment_id,
			// 		shift_id: req.body.shift.id,
			// 	},
			// 	raw: true,
			// });

			// couponsToDelete = dbCoupons.filter(
			// 	(dbCoupon) =>
			// 		!req.body.coupons
			// 			.filter((el) => el.db_id)
			// 			.some((reqCoupon) => reqCoupon.db_id === dbCoupon.id)
			// );
			// const couponsToDeleteIds = couponsToDelete.map((el) => el.id);

			// const updateCouponsPromises = couponsToEdit.map((el) => {
			// 	return BranchWithdrawalsModel.update(el, {
			// 		where: { id: el.db_id },
			// 		transaction: t,
			// 	});
			// });

			// await BranchWithdrawalsModel.bulkCreate(couponsToAdd, {
			// 	transaction: t,
			// });

			// await Promise.all(updateCouponsPromises);

			// await BranchWithdrawalsModel.destroy({
			// 	where: {
			// 		id: {
			// 			[Op.in]: couponsToDeleteIds,
			// 		},
			// 	},
			// 	transaction: t,
			// });

			await MovmentsShiftsModel.update(
				{ state: req.body.state },
				{
					where: {
						id: req.body.shift.id,
					},
					raw: true,
					transaction: t,
				}
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.spicialEditShiftMovment = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const currDate = new Date(req.body.date);
			const nextDay = new Date(req.body.date);
			nextDay.setDate(currDate.getDate() + 1);
			//update despensers
			//update curr shift
			for (const { id, curr_A, curr_B, price, employee_id } of req.body
				.dispensers) {
				await DispenserMovmentModel.update(
					{
						curr_A: curr_A,
						curr_B: curr_B,
						price: price,
						employee_id: employee_id,
						state: req.body.state,
					},
					{
						where: { id: id },
						transaction: t, // Condition to match the record by 'id'
					}
				);
			}

			//get next shift
			const currMovment = await MovmentModel.findByPk(req.body.movment_id, {
				raw: true,
			});

			if (currMovment.shifts > req.body.shift.number) {
				for (const { curr_A, curr_B, dispenser } of req.body.dispensers) {
					const { id } = dispenser;
					const nextShift = await MovmentsShiftsModel.findOne({
						where: {
							movment_id: currMovment.id,
							number: req.body.shift.number + 1,
							station_id: req.body.station_id,
						},
						raw: true,
					});
					await DispenserMovmentModel.update(
						{
							prev_A: curr_A,
							prev_B: curr_B,
						},
						{
							where: {
								dispenser_id: id,
								shift_id: nextShift.id,
								movment_id: req.body.movment_id,
							},
							transaction: t,
						}
					);
				}
			} else {
				const nextMovment = await MovmentModel.findOne({
					where: { date: nextDay, station_id: req.body.station_id },
					raw: true,
				});
				if (nextMovment) {
					for (const { curr_A, curr_B, dispenser } of req.body.dispensers) {
						const { id } = dispenser;
						const nextShift = await MovmentsShiftsModel.findOne({
							where: {
								movment_id: nextMovment.id,
								number: 1,
							},
							raw: true,
						});
						await DispenserMovmentModel.update(
							{
								prev_A: curr_A,
								prev_B: curr_B,
							},
							{
								where: {
									dispenser_id: id,
									shift_id: nextShift.id,
									movment_id: nextMovment.id,
								},
								transaction: t,
							}
						);
					}
				}
			}
			//update stores
			//update curr shift
			for (const { id, curr_value, price } of req.body.currStoresMovments) {
				await StoreMovmentModel.update(
					{
						curr_value: curr_value,
						price: price,
						state: req.body.state,
					},
					{
						where: { id: id },
						transaction: t, // Condition to match the record by 'id'
					}
				);
			}

			//update next shifts

			const station = await StationModel.findByPk(req.body.station_id, {
				raw: true, // Return raw data (plain object)
			});
			const nextMovments = await MovmentModel.findAll({
				where: {
					station_id: req.body.station_id,
					date: {
						[Op.between]: [currDate, station.start_date],
					},
				},
				attributes: ["id"], // Only select the 'id' field
				raw: true, // Return raw data (plain object)
			});

			if (currMovment.shifts > req.body.shift.number) {
				for (const { old_curr_value, curr_value, store_id } of req.body
					.currStoresMovments) {
					const diff = curr_value - old_curr_value;
					const nextShifts = await MovmentsShiftsModel.findAll({
						where: {
							movment_id: currMovment.id,
							number: {
								[Op.gt]: req.body.shift.number,
							},
						},
						raw: true,
					});
					const shiftsIds = nextShifts.map((el) => el.id);
					await StoreMovmentModel.update(
						{
							prev_value: req.db.literal(`prev_value + ${diff}`),
							curr_value: req.db.literal(`curr_value + ${diff}`),
						},
						{
							where: {
								store_id: store_id,
								shift_id: {
									[Op.in]: shiftsIds,
								},
								movment_id: req.body.movment_id,
							},
							transaction: t,
						}
					);
				}
			}

			if (nextMovments.length > 0) {
				const nextMovmentsIds = nextMovments.map((el) => el.id);
				for (const { old_curr_value, curr_value, store_id } of req.body
					.currStoresMovments) {
					const diff = curr_value - old_curr_value;
					await StoreMovmentModel.update(
						{
							prev_value: req.db.literal(`prev_value + ${diff}`),
							curr_value: req.db.literal(`curr_value + ${diff}`),
						},
						{
							where: {
								store_id: store_id,
								movment_id: {
									[Op.in]: nextMovmentsIds,
								},
							},
							transaction: t,
						}
					);
				}
			}

			//updating others
			let othersToAdd = [];
			let othersToEdit = [];
			let othersToDelete = [];
			req.body.others.forEach((el) => {
				if (el.db_id) {
					othersToEdit.push({
						store_id: el.store,
						store_movment_id: req.body.currStoresMovments.filter(
							(ele) => ele.store_id === el.store
						)[0].id,
						amount: +el.amount,
						type: el.type,
						price: el.price,
						title: el.title,
						employee_id: el.employee_id,
						db_id: el.db_id,
					});
				}
				if (!el.db_id) {
					othersToAdd.push({
						station_id: +req.body.station_id,
						movment_id: +req.body.movment_id,
						shift_id: req.body.shift.id,
						store_id: el.store,
						store_movment_id: req.body.currStoresMovments.filter(
							(ele) => ele.store_id === el.store
						)[0].id,
						amount: +el.amount,
						type: el.type,
						title: el.title,

						price: el.substance.price,
						employee_id: el.employee_id,
					});
				}
			});

			const dbOthers = await OtherModel.findAll({
				where: {
					movment_id: req.body.movment_id,
					shift_id: req.body.shift.id,
				},
				raw: true,
			});

			othersToDelete = dbOthers.filter(
				(dbOther) =>
					!req.body.others
						.filter((el) => el.db_id)
						.some((reqOther) => reqOther.db_id === dbOther.id)
			);
			const othersToDeleteIds = othersToDelete.map((el) => el.id);
			const updateOthersPromises = othersToEdit.map((el) => {
				return OtherModel.update(el, {
					where: { id: el.db_id },
					transaction: t,
				});
			});
			await Promise.all(updateOthersPromises);

			await OtherModel.destroy({
				where: {
					id: {
						[Op.in]: othersToDeleteIds,
					},
				},
				transaction: t,
			});

			await OtherModel.bulkCreate(othersToAdd, {
				transaction: t,
			});
			// updating credit sales
			let creditSalesToAdd = [];
			let creditSalesToEdit = [];
			let creditSalesToDelete = [];

			req.body.creditSales.forEach((el) => {
				if (el.db_id) {
					creditSalesToEdit.push({
						store_id: el.store,
						client_id: el.client,
						amount: +el.amount,
						price: el.price,
						title: el.title,
						db_id: el.db_id,
						employee_id: el.employee_id,
					});
				}

				if (!el.db_id) {
					creditSalesToAdd.push({
						station_id: +req.body.station_id,
						movment_id: +req.body.movment_id,
						shift_id: req.body.shift.id,
						store_id: el.store,
						client_id: el.client,
						amount: +el.amount,
						title: el.title,
						price: el.substance.price,
						employee_id: el.employee_id,
					});
				}
			});

			const dbCreditSales = await CreditSaleModel.findAll({
				where: {
					movment_id: req.body.movment_id,
					shift_id: req.body.shift.id,
				},
				raw: true,
			});

			creditSalesToDelete = dbCreditSales.filter(
				(dbCreditSale) =>
					!req.body.creditSales
						.filter((el) => el.db_id)
						.some((reqCreditSale) => reqCreditSale.db_id === dbCreditSale.id)
			);

			const creditSaleToDeleteIds = creditSalesToDelete.map((el) => el.id);

			const updateCreditSalesPromises = creditSalesToEdit.map((el) => {
				return CreditSaleModel.update(el, {
					where: { id: el.db_id },
					transaction: t,
				});
			});

			await Promise.all(updateCreditSalesPromises);

			await CreditSaleModel.destroy({
				where: {
					id: {
						[Op.in]: creditSaleToDeleteIds,
					},
				},
				transaction: t,
			});

			await CreditSaleModel.bulkCreate(creditSalesToAdd, {
				transaction: t,
			});
			//updating coupons
			// let couponsToAdd = [];
			// let couponsToEdit = [];
			// let couponsToDelete = [];
			// req.body.coupons.forEach((el) => {
			// 	if (el.db_id) {
			// 		couponsToEdit.push({
			// 			station_id: +req.body.station_id,
			// 			movment_id: +req.body.movment_id,
			// 			store_id: el.store,
			// 			store_movment_id: req.body.currStoresMovments.filter(
			// 				(ele) => ele.store_id === el.store
			// 			)[0].id,
			// 			amount: +el.amount,
			// 			type: el.type,
			// 			price: el.price,
			// 			employee_id: el.employee_id,
			// 			db_id: el.db_id,
			// 		});
			// 	}
			// 	if (!el.db_id) {
			// 		couponsToAdd.push({
			// 			station_id: +req.body.station_id,
			// 			movment_id: +req.body.movment_id,
			// 			shift_id: req.body.shift.id,
			// 			store_id: el.store,
			// 			store_movment_id: req.body.currStoresMovments.filter(
			// 				(ele) => ele.store_id === el.store
			// 			)[0].id,
			// 			amount: +el.amount,
			// 			type: el.type,

			// 			price: el.substance.price,
			// 			employee_id: el.employee_id,
			// 		});
			// 	}
			// });

			// const dbCoupons = await BranchWithdrawalsModel.findAll({
			// 	where: {
			// 		movment_id: req.body.movment_id,
			// 		shift_id: req.body.shift.id,
			// 	},
			// 	raw: true,
			// });

			// couponsToDelete = dbCoupons.filter(
			// 	(dbCoupon) =>
			// 		!req.body.coupons
			// 			.filter((el) => el.db_id)
			// 			.some((reqCoupon) => reqCoupon.db_id === dbCoupon.id)
			// );
			// const couponsToDeleteIds = couponsToDelete.map((el) => el.id);

			// const updateCouponsPromises = couponsToEdit.map((el) => {
			// 	return BranchWithdrawalsModel.update(el, {
			// 		where: { id: el.db_id },
			// 		transaction: t,
			// 	});
			// });

			// await BranchWithdrawalsModel.bulkCreate(couponsToAdd, {
			// 	transaction: t,
			// });

			// await Promise.all(updateCouponsPromises);

			// await BranchWithdrawalsModel.destroy({
			// 	where: {
			// 		id: {
			// 			[Op.in]: couponsToDeleteIds,
			// 		},
			// 	},
			// 	transaction: t,
			// });

			await MovmentsShiftsModel.update(
				{ state: req.body.state },
				{
					where: {
						id: req.body.shift.id,
					},
					raw: true,
					transaction: t,
				}
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error.errors[0].message, 500));
	}
});
exports.deleteMovment = catchAsync(async (req, res, next) => {
	try {
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		await MovmentModel.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.changeMovmentState = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StationModel = getModel(req.headers["x-year"], "station");
			const UserStationModel = getModel(req.headers["x-year"], "user_station");
			const UserModel = getModel(req.headers["x-year"], "user");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const calibrationModel = getModel(req.headers["x-year"], "calibration");
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const BranchWithdrawalsModel = getModel(
				req.headers["x-year"],
				"branch_withdrawals"
			);
			const OtherModel = getModel(req.headers["x-year"], "other");
			const PermissionModel = getModel(req.headers["x-year"], "permission");
			if (req.body.state === "pending") {
				// التحقق من وجود حركة معلقة
				const checkPendingMovment = await MovmentModel.findOne({
					where: { station_id: req.body.station_id, state: "pending" },
					order: [["createdAt", "DESC"]],
				});
				if (checkPendingMovment) {
					return next(new AppError("لا يمكن فتح أكثر من حركة بنفس الوقت", 500));
				}

				// تحديث الحالات لبقية الجداول
				const movments = await MovmentModel.findAll({
					where: {
						station_id: req.body.station_id,
						date: {
							[Op.gte]: req.body.date, // استخدام Op.gte للمقارنة
						},
					},
					include: [{ model: StationModel, attributes: ["name"] }],
				});

				let movmentsIds = [];
				movments.forEach((el) => movmentsIds.push(el.id));

				await MovmentModel.update(
					{ state: req.body.state },
					{ where: { id: { [Op.in]: movmentsIds } }, transaction: t }
				);

				// استكمال التحديث لبقية الجداول إذا لزم الأمر:
				await DispenserMovmentModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await StoreMovmentModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await MovmentsShiftsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await IncomeModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await calibrationModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await SurplusModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await BranchWithdrawalsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await OtherModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);

				const movmentsLines = movments
					.map((movment) => {
						return `• ${movment.date}`;
					})
					.join("\n");
				const users = await UserStationModel.findAll({
					where: { station_id: req.body.station_id },
					raw: true,
				});
				const usersStationsIds = users.map((el) => el.user_id);
				const usersWithEditNotification = await PermissionModel.findAll({
					where: {
						permission: "editNotification",
						user_id: { [Op.in]: usersStationsIds },
					},
					raw: true,
				});
				const usersIds = usersWithEditNotification.map((el) => el.user_id);
				const usersPhones = await UserModel.findAll({
					where: { id: { [Op.in]: usersIds } },
					raw: true,
				});

				for (const user of usersPhones) {
					await notificationQueue.add("send-whatsapp", {
						recipient: user.phone,
						message: `تم فتح حركة الايام التالية لـ ${movments[0].station.name}\n${movmentsLines}`,
					});
				}
			}
			if (req.body.state === "approved") {
				// التحقق من وجود حركة معلقة بتاريخ سابق
				const checkPendingMovment = await MovmentModel.findAll({
					where: {
						station_id: req.body.station_id,
						state: "pending",
						date: {
							[Op.lt]: req.body.date,
						},
					},
					raw: true,
				});
				if (checkPendingMovment.length > 0) {
					return next(
						new AppError(
							"لا يمكن تأكيد الحركة لوجود حركة معلقة بتاريخ سابق",
							500
						)
					);
				}

				await MovmentModel.update(
					{ state: req.body.state },
					{ where: { id: req.body.movment_id }, transaction: t }
				);
				// إرسال إشعار عبر WhatsApp
				const movment = await MovmentModel.findByPk(req.body.movment_id, {
					include: [{ model: StationModel, attributes: ["name"] }],
					raw: true,
				});
				const lastShift = await MovmentsShiftsModel.findOne({
					where: { movment_id: req.body.movment_id, number: movment.shifts },
				});
				const storesData = await StoreMovmentModel.findAll({
					where: { movment_id: req.body.movment_id, shift_id: lastShift.id },
					include: [
						{
							model: StoreModel,
							attributes: ["name"],
							include: [{ model: SubstanceModel, attributes: ["name"] }],
						},
					],
					raw: true,
				});
				const incomes = await IncomeModel.findAll({
					where: {
						movment_id: req.body.movment_id,
					},
					raw: true,
				});
				const storeLines = storesData
					.map((store) => {
						const storeName = store["store.name"];
						let income = 0;
						const filteredIncomes = incomes.filter(
							(el) => el.store_id === store.store_id
						);
						filteredIncomes.forEach((el) => (income = income + el.amount));
						const value = store.curr_value;
						const sales = store.prev_value + income - store.curr_value;

						const substance = store["store.substance.name"];
						return `${storeName}-${substance}:\nالمبيعات:${sales}لتر${
							store.deficit > 0
								? `\nالرصيد الدفتري:${value}لتر\nالعجز:${store.deficit}لتر`
								: ""
						}\nالرصيد الفعلي:${value - store.deficit}لتر`;
					})
					.join("\n===============\n");

				const users = await UserStationModel.findAll({
					where: { station_id: movment.station_id },
					raw: true,
				});

				const usersStationsIds = users.map((el) => el.user_id);
				const usersWithConfirmNotification = await PermissionModel.findAll({
					where: {
						permission: "confirmNotification",
						user_id: { [Op.in]: usersStationsIds },
					},
					raw: true,
				});
				const usersIds = usersWithConfirmNotification.map((el) => el.user_id);
				const usersPhones = await UserModel.findAll({
					where: { id: { [Op.in]: usersIds } },
					raw: true,
				});
				for (const user of usersPhones) {
					await notificationQueue.add("send-whatsapp", {
						recipient: user.phone,
						message: `تم ادخال الحركة بتاريخ ${movment.date} لـ ${movment["station.name"]} \n• أرصدة المخازن:\n ${storeLines}`,
					});
				}
				await IncomeModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await calibrationModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await SurplusModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await BranchWithdrawalsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await OtherModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
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
exports.spicialChangeMovmentState = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			if (req.body.state === "pending") {
				// التحقق من وجود حركة معلقة
				const checkPendingMovment = await MovmentModel.findOne({
					where: { station_id: req.body.station_id, state: "pending" },
					order: [["createdAt", "DESC"]],
				});
				if (checkPendingMovment) {
					return next(new AppError("لا يمكن فتح أكثر من حركة بنفس الوقت", 500));
				}

				// تحديث الحالات لبقية الجداول
				const station = await StationModel.findByPk(req.body.station_id, {
					raw: true, // Return raw data (plain object)
				});

				const movments = await MovmentModel.findAll({
					where: {
						station_id: req.body.station_id,
						date: {
							[Op.between]: [req.body.date, station.start_date],
						},
					},
					include: [{ model: StationModel, attributes: ["name"] }],
				});

				let movmentsIds = [];
				movments.forEach((el) => movmentsIds.push(el.id));

				await MovmentModel.update(
					{ state: req.body.state },
					{ where: { id: { [Op.in]: movmentsIds } }, transaction: t }
				);

				// استكمال التحديث لبقية الجداول إذا لزم الأمر:
				await DispenserMovmentModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await StoreMovmentModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await MovmentsShiftsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await IncomeModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await calibrationModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await SurplusModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await BranchWithdrawalsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);
				await OtherModel.update(
					{ state: req.body.state },
					{ where: { movment_id: { [Op.in]: movmentsIds } }, transaction: t }
				);

				const movmentsLines = movments
					.map((movment) => {
						return `• ${movment.date}`;
					})
					.join("\n");
				const users = await UserStationModel.findAll({
					where: { station_id: req.body.station_id },
					raw: true,
				});
				const usersStationsIds = users.map((el) => el.user_id);
				const usersWithEditNotification = await PermissionModel.findAll({
					where: {
						permission: "editNotification",
						user_id: { [Op.in]: usersStationsIds },
					},
					raw: true,
				});
				const usersIds = usersWithEditNotification.map((el) => el.user_id);
				const usersPhones = await UserModel.findAll({
					where: { id: { [Op.in]: usersIds } },
					raw: true,
				});

				for (const user of usersPhones) {
					await notificationQueue.add("send-whatsapp", {
						recipient: user.phone,
						message: `تم فتح حركة الايام التالية لـ ${movments[0].station.name}\n${movmentsLines}`,
					});
				}
			}
			if (req.body.state === "approved") {
				// التحقق من وجود حركة معلقة بتاريخ سابق
				const checkPendingMovment = await MovmentModel.findAll({
					where: {
						station_id: req.body.station_id,
						state: "pending",
						date: {
							[Op.lt]: req.body.date,
						},
					},
					raw: true,
				});
				if (checkPendingMovment.length > 0) {
					return next(
						new AppError(
							"لا يمكن تأكيد الحركة لوجود حركة معلقة بتاريخ سابق",
							500
						)
					);
				}

				await MovmentModel.update(
					{ state: req.body.state },
					{ where: { id: req.body.movment_id }, transaction: t }
				);
				// إرسال إشعار عبر WhatsApp
				const movment = await MovmentModel.findByPk(req.body.movment_id, {
					include: [{ model: StationModel, attributes: ["name"] }],
					raw: true,
				});
				const lastShift = await MovmentsShiftsModel.findOne({
					where: { movment_id: req.body.movment_id, number: movment.shifts },
				});
				const storesData = await StoreMovmentModel.findAll({
					where: { movment_id: req.body.movment_id, shift_id: lastShift.id },
					include: [
						{
							model: StoreModel,
							attributes: ["name"],
							include: [{ model: SubstanceModel, attributes: ["name"] }],
						},
					],
					raw: true,
				});
				const incomes = await IncomeModel.findAll({
					where: {
						movment_id: req.body.movment_id,
					},
					raw: true,
				});
				const storeLines = storesData
					.map((store) => {
						const storeName = store["store.name"];
						let income = 0;
						const filteredIncomes = incomes.filter(
							(el) => el.store_id === store.store_id
						);
						filteredIncomes.forEach((el) => (income = income + el.amount));
						const value = store.curr_value;
						const sales = store.prev_value + income - store.curr_value;

						const substance = store["store.substance.name"];
						return `${storeName}-${substance}:\nالمبيعات:${sales}لتر${
							store.deficit > 0
								? `\nالرصيد الدفتري:${value}لتر\nالعجز:${store.deficit}لتر`
								: ""
						}\nالرصيد الفعلي:${value - store.deficit}لتر`;
					})
					.join("\n===============\n");

				const users = await UserStationModel.findAll({
					where: { station_id: movment.station_id },
					raw: true,
				});

				const usersStationsIds = users.map((el) => el.user_id);
				const usersWithConfirmNotification = await PermissionModel.findAll({
					where: {
						permission: "confirmNotification",
						user_id: { [Op.in]: usersStationsIds },
					},
					raw: true,
				});
				const usersIds = usersWithConfirmNotification.map((el) => el.user_id);
				const usersPhones = await UserModel.findAll({
					where: { id: { [Op.in]: usersIds } },
					raw: true,
				});
				for (const user of usersPhones) {
					await notificationQueue.add("send-whatsapp", {
						recipient: user.phone,
						message: `تم ادخال الحركة بتاريخ ${movment.date} لـ ${movment["station.name"]} \n• أرصدة المخازن:\n ${storeLines}`,
					});
				}
				await IncomeModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await calibrationModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await SurplusModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await BranchWithdrawalsModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
				);
				await OtherModel.update(
					{ state: req.body.state },
					{ where: { movment_id: req.body.movment_id }, transaction: t }
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
exports.getMovmentReport = catchAsync(async (req, res, next) => {
	try {
		let dispensersMovment = [];
		let storesMovment = [];
		await req.db.transaction(async (t) => {
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const DispenserModel = getModel(req.headers["x-year"], "dispenser");
			const DispenserMovmentModel = getModel(
				req.headers["x-year"],
				"dispenser_movment"
			);
			const StoreModel = getModel(req.headers["x-year"], "store");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const TankModel = getModel(req.headers["x-year"], "tank");
			const IncomeModel = getModel(req.headers["x-year"], "income");
			const calibrationModel = getModel(req.headers["x-year"], "calibration");
			const SurplusModel = getModel(req.headers["x-year"], "surplus");

			const OtherModel = getModel(req.headers["x-year"], "other");
			const ClientModel = getModel(req.headers["x-year"], "client");
			const CreditSaleModel = getModel(req.headers["x-year"], "credit_sale");

			const movment = await MovmentModel.findOne({
				where: {
					id: req.params.id,
				},
				transaction: t,
			});
			const firstShift = await MovmentsShiftsModel.findOne({
				where: { movment_id: movment.id, number: 1 },
				raw: true,
			});
			const lastShift = await MovmentsShiftsModel.findOne({
				where: { movment_id: movment.id, number: movment.shifts },
				raw: true,
			});
			//find 1st data
			const dispensersMovments1 = await DispenserMovmentModel.findAll({
				where: {
					movment_id: req.params.id,
					shift_id: firstShift.id,
					is_active: 1,
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
				order: [[{ model: DispenserModel }, "number", "ASC"]],
				transaction: t,
			});

			const storesMovments1 = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.params.id,
					shift_id: firstShift.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name", "type"],
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

			//find last data
			if (movment.shifts > 1) {
				const dispensersMovments2 = await DispenserMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: lastShift.id,
						is_active: 1,
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
					order: [[{ model: DispenserModel }, "number", "ASC"]],
					raw: true,
					transaction: t,
				});
				const storesMovments2 = await StoreMovmentModel.findAll({
					where: {
						movment_id: req.params.id,
						shift_id: lastShift.id,
					},
					raw: true,
					transaction: t,
				});

				dispensersMovment = dispensersMovments2.map((el) => {
					const data = dispensersMovments1.filter(
						(ele) => ele.dispenser_id === el.dispenser_id
					)[0];
					return {
						id: el.id,
						prev_A: data.prev_A,
						curr_A: el.curr_A,
						prev_B: data.prev_B,
						curr_B: el.curr_B,
						substance: data.dispenser.tank.substance.name,
						substance_id: data.dispenser.tank.substance.id,
						number: data.dispenser.number,
					};
				});
				storesMovment = storesMovments2.map((el) => {
					const data = storesMovments1.filter(
						(ele) => ele.store_id === el.store_id
					)[0];

					return {
						id: el.id,
						store_id: el.store_id,
						prev_value: data.prev_value,
						curr_value: el.curr_value,
						name: data.store.name,
						substance: data.store.substance.name,
						substance_id: data.store.substance.id,
						type: data.store.type,
						price: data.price,
					};
				});
			} else {
				storesMovment = storesMovments1.map((el) => {
					return {
						id: el.id,
						store_id: el.store_id,
						prev_value: el.prev_value,
						curr_value: el.curr_value,
						name: el.store.name,
						substance: el.store.substance.name,
						substance_id: el.store.substance.id,
						type: el.store.type,
						price: el.price,
					};
				});
				dispensersMovment = dispensersMovments1.map((el) => {
					return {
						id: el.id,
						prev_A: el.prev_A,
						curr_A: el.curr_A,
						prev_B: el.prev_B,
						curr_B: el.curr_B,
						substance: el.dispenser.tank.substance.name,
						substance_id: el.dispenser.tank.substance.id,
						number: el.dispenser.number,
					};
				});
			}

			const incomes = await IncomeModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const creditSales = await CreditSaleModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
					{
						model: ClientModel,
						attributes: ["name"],
					},
				],
				transaction: t,
			});
			const calibrations = await calibrationModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const surplus = await SurplusModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			const others = await OtherModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["name"],
							},
						],
					},
				],
				transaction: t,
			});
			// const coupons = await BranchWithdrawalsModel.findAll({
			// 	where: {
			// 		movment_id: req.params.id,
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
			res.status(200).json({
				state: "success",
				storesMovment,
				dispensersMovment,
				incomes,
				others,
				surplus,
				calibrations,
				// coupons,
				creditSales,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
