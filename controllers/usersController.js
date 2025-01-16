const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const UserModel = require("./../models/userModel");
const PermissionModel = require("./../models/permissionModel");
const { Op } = require("sequelize");
const sequelize = require("./../connection");
const UserStationModel = require("../models/userStationModel");
exports.getAllUsers = catchAsync(async (req, res, next) => {
	try {
		// Fetch users from the database
		const users = await UserModel.findAll({
			attributes: ["id", "username", "first_name", "last_name", "phone_number"],
			where: {
				username: {
					[Op.ne]: "admin", // Exclude the 'admin' user from the results
				},
			},
		});

		res.status(200).json({
			status: "success",
			users: users,
		});
	} catch (error) {
		// Handle any errors that occur during the user fetching process
		return next(new AppError(error, 500));
	}
});
exports.getUser = catchAsync(async (req, res, next) => {
	try {
		const userId = req.params.id;

		// Fetch user details from the UserModel
		const user = await UserModel.findOne({
			where: { id: userId },
			attributes: ["id", "username", "first_name", "last_name", "phone_number"],
		});

		if (!user) {
			return next(new AppError("User not found", 404));
		}

		// Fetch permissions for the user from the PermissionModel
		const permissions = await PermissionModel.findAll({
			where: { user_id: userId },
		});
		// Fetch permissions for the user from the PermissionModel
		const stations = await UserStationModel.findAll({
			where: { user_id: userId },
		});

		res.status(200).json({
			status: "success",
			user,
			permissions,
			stations,
		});
	} catch (error) {
		// Handle any errors that occur during the user fetching process
		return next(new AppError(error, 500));
	}
});
exports.getUsername = catchAsync(async (req, res, next) => {
	try {
		const userId = req.params.id;

		// Fetch the username of the user from the UserModel
		const user = await UserModel.findOne({
			where: { id: userId },
			attributes: ["username"],
		});

		if (!user) {
			return next(new AppError("المستخدم غير موجود", 404));
		}

		res.status(200).json({
			status: "success",
			username: user.username,
		});
	} catch (error) {
		// Handle any errors that occur during the username fetching process
		return next(new AppError(error, 500));
	}
});
exports.addUser = catchAsync(async (req, res, next) => {
	try {
		// Check if the username already exists
		const existingUser = await UserModel.findOne({
			where: { username: req.body.username },
		});
		if (existingUser) {
			return next(new AppError("Username already exists", 500));
		}

		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(req.body.password, salt);

		let newUser;
		let permissions = [];

		const transaction = await sequelize.transaction(); // Start a transaction

		try {
			// Create the new user within the transaction
			newUser = await UserModel.create(
				{
					username: req.body.username,
					password: hashedPassword,
					first_name: req.body.firstname,
					last_name: req.body.lastname,
				},
				{ transaction }
			);

			// Add permissions for the new user within the transaction
			Object.entries(req.body.permissions).forEach(([permission, value]) => {
				if (value === true) {
					permissions.push({ user_id: newUser.id, permission: permission });
				}
			});
			const userStationsArr = req.body.stations.map((station) => {
				return { user_id: newUser.id, station_id: station.id };
			});

			await PermissionModel.bulkCreate(permissions, { transaction });
			await UserStationModel.bulkCreate(userStationsArr, { transaction });

			await transaction.commit();
			res.status(200).json({
				state: "success",
			});
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	} catch (error) {
		// Handle any errors that occur during the user creation process
		return next(new AppError(error, 500));
	}
});
exports.deleteUser = catchAsync(async (req, res, next) => {
	try {
		if (req.params.id === "1") {
			return next(new AppError("لايمكن حذف هذا المستخدم", 500));
		}

		// Find the user by ID and delete it
		const user = await UserModel.findByPk(req.params.id);
		if (!user) {
			return next(new AppError("User not found", 404));
		}

		await user.destroy();

		res.status(200).json({ state: "success" });
	} catch (error) {
		// Handle any errors that occur during the user deletion process
		return next(new AppError("حصل خطا أثناء حذف المستخدم", 500));
	}
});

exports.updateUser = catchAsync(async (req, res, next) => {
	let transaction;

	try {
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(req.body.password, salt);

		transaction = await sequelize.transaction(); // Start a transaction

		// Update the user's information
		await UserModel.update(
			{
				username: req.body.username,
				password: hashedPassword,
				first_name: req.body.firstname,
				last_name: req.body.lastname,
			},
			{ where: { id: req.params.id }, transaction }
		);

		// Get existing permissions for the user
		const existingPermissions = await PermissionModel.findAll({
			where: { user_id: req.params.id },
			transaction,
		});

		const existingPermissionsSet = new Set(
			existingPermissions.map((row) => row.permission)
		);

		// Update permissions based on the request body
		const permissionsToUpdate = [];
		const permissionsToDelete = [];

		for (const [permission, value] of Object.entries(req.body.permissions)) {
			if (value === true && !existingPermissionsSet.has(permission)) {
				permissionsToUpdate.push({
					user_id: req.params.id,
					permission: permission,
				});
			} else if (value === false && existingPermissionsSet.has(permission)) {
				permissionsToDelete.push(permission);
			}
		}

		// Update permissions within the same transaction
		await Promise.all([
			PermissionModel.bulkCreate(permissionsToUpdate, { transaction }),
			PermissionModel.destroy({
				where: { user_id: req.params.id, permission: permissionsToDelete },
				transaction,
			}),
		]);
		// Update user_stations based on the request body
		const stationsToUpdate = req.body.stations.map((station) => {
			return {
				user_id: req.params.id,
				station_id: station.station_id,
			};
		});

		// Get existing user_stations for the user
		const existingStations = await UserStationModel.findAll({
			where: { user_id: req.params.id },
			transaction,
		});

		const existingStationSet = new Set(
			existingStations.map((row) => row.station_id)
		);

		// Identify stations to add and delete
		const stationsToAdd = stationsToUpdate.filter(
			(station) => !existingStationSet.has(station.station_id)
		);
		const stationsToDelete = existingStations.filter(
			(station) =>
				!stationsToUpdate.some((s) => s.station_id === station.station_id)
		);

		// Update user_stations within the same transaction
		await Promise.all([
			UserStationModel.bulkCreate(stationsToAdd, { transaction }),
			UserStationModel.destroy({
				where: {
					user_id: req.params.id,
					station_id: stationsToDelete.map((s) => s.station_id),
				},
				transaction,
			}),
		]);

		// Commit the transaction
		await transaction.commit();

		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		// Rollback the transaction in case of an error
		await transaction.rollback();

		// Handle errors
		return next(new AppError("حصل خطا اثناء تحديث بيانات المستخدم", 500));
	}
});
