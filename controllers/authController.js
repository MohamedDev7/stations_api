const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");
const { raw } = require("mysql2");

exports.login = catchAsync(async (req, res, next) => {
	const AppVersion = process.env.APP_VERSION;
	try {
		const year = process.env.YEAR;
		const UserModel = getModel(year, "user");
		const PermissionModel = getModel(year, "permission");
		const UserStationModel = getModel(year, "user_station");
		const DeviceModel = getModel(year, "device");
		// const SessionModel = getModel(year, "session");
		const UnauthorizedDevice = getModel(year, "unauthorized_device");

		const user = await UserModel.findOne({
			where: {
				username: req.body.username,
			},
		});
		// if (req.headers.appversion !== AppVersion) {
		// 	return next(
		// 		new AppError(
		// 			`اصدار السيرفر ${AppVersion}\n اصدار البرنامج ${req.headers.appversion}`,

		// 			401
		// 		)
		// 	);
		// }
		if (!user) {
			return next(new AppError("المستخدم غير موجود", 404));
		}
		// check device
		const device = await DeviceModel.findOne({
			where: {
				device_id: req.body.deviceId,
			},
		});
		// if (!device) {
		// 	await UnauthorizedDevice.create({
		// 		device_id: req.body.deviceId,
		// 	});
		// 	return next(
		// 		new AppError(
		// 			"لا تمتلك صلاحية الدخول من هذا الجهاز،يرجى التواصل مع تقنية المعلومات.",
		// 			401
		// 		)
		// 	);
		// }

		const checkPassword = bcrypt.compareSync(req.body.password, user.password);
		if (!checkPassword) {
			return next(new AppError("خطأ في كلمة المرور", 401));
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

		// Omitting password field from the user object
		const { password, ...others } = user.toJSON();

		// Fetch permissions for the user
		const permissions = await PermissionModel.findAll({
			where: {
				user_id: user.id,
			},
		});
		const stations = await UserStationModel.findAll({
			where: {
				user_id: user.id,
			},
		});

		const permissionsObject = {};
		permissions.forEach((permission) => {
			permissionsObject[permission.permission] = true;
		});

		res.status(200).json({
			token,
			status: "good",
			user: others,
			permissions: permissionsObject,
			stations,
			year: process.env.YEAR,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

// SESSION-BASED checkSession COMMENTED OUT - Using JWT tokens instead
// exports.checkSession = catchAsync(async (req, res, next) => { ... });

// SESSION-BASED debugSession COMMENTED OUT
// exports.debugSession = catchAsync(async (req, res) => { ... });

// JWT-based protect middleware
exports.protect = catchAsync(async (req, res, next) => {
	// Get token from Authorization header
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(new AppError("يرجى تسجيل الدخول مرة اخرى", 401));
	}

	// Verify token
	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return next(new AppError("توكن غير صالح، يرجى تسجيل الدخول مرة أخرى", 401));
	}

	// Determine year based on admin permission
	const requestedYear = req.year || req.query.year || req.body.year;
	const serverYear = process.env.YEAR;

	// First get user to check admin permission
	const UserModel = getModel(serverYear, "user");
	const PermissionModel = getModel(serverYear, "permission");

	const user = await UserModel.findByPk(decoded.id);
	if (!user) {
		return next(
			new AppError("المستخدم غير موجود، يرجى تسجيل الدخول مرة أخرى", 401)
		);
	}

	// Check if user has connectToPrevYear permission
	const permissions = await PermissionModel.findAll({
		where: { user_id: user.id },
		raw: true,
	});

	const hasConnectPermission = permissions.some(
		(p) => p.permission === "connectToPrevYear"
	);

	let year;
	if (requestedYear) {
		// Request has year specified
		if (hasConnectPermission) {
			year = requestedYear;
		} else {
			return next(new AppError("ليس لديك الصلاحية للاتصال بسنوات سابقة", 403));
		}
	} else {
		// No year specified, use server default
		year = serverYear;
	}
	req.year = year;

	// Omitting password field from the user object
	const { password, ...others } = user.toJSON();
	req.user = others;
	next();
});

// Simple logout for token-based auth
exports.logout = catchAsync(async (req, res, next) => {
	// With JWT, we just tell the client to delete the token
	// No server-side session to destroy
	res.status(200).json({
		status: "success",
		message: "تم تسجيل الخروج بنجاح",
	});
});

// SESSION-BASED deleteSession and deleteAllUserSessions COMMENTED OUT
// exports.deleteSession = catchAsync(async (req, res, next) => { ... });
// exports.deleteAllUserSessions = catchAsync(async (req, res, next) => { ... });

exports.restrictTo = (permission) => {
	return catchAsync(async (req, res, next) => {
		const year = req.year || process.env.YEAR;
		const PermissionModel = getModel(year, "permission");
		const UserStationModel = getModel(year, "user_station");

		// Find permissions for the user
		const permissions = await PermissionModel.findAll({
			where: {
				user_id: req.user.id,
			},
		});
		const stations = await UserStationModel.findAll({
			where: {
				user_id: req.user.id,
			},
		});
		req.stations = stations;
		const userPermissions = permissions.map((el) => el.permission);
		if (!userPermissions.includes(permission)) {
			return next(
				new AppError(
					"عذراً، ليس لديك الصلاحية لتنفيذ هذه العملية. الرجاء التواصل مع مدير النظام",
					403
				)
			);
		}

		next();
	});
};
exports.restrictToStations = async (req, res, next) => {
	try {
		const year = req.year || process.env.YEAR;
		const StationModel = getModel(year, "station");
		const UserStationModel = getModel(year, "user_station");
		let stationsArr = [];
		if (req.user.id === 1) {
			stations = await StationModel.findAll({});
			stationsArr = stations.map((el) => el.id);
		} else {
			stations = await UserStationModel.findAll({
				where: {
					user_id: req.user.id,
				},
			});
			stationsArr = stations.map((el) => el.station_id);
		}
		req.stations = stationsArr;
		next();
	} catch (error) {
		return next(error);
	}
};
