const express = require("express");
const notificationsController = require("./../controllers/notificationsController");
const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

const router = express.Router();
router.post(
	"/send",
	upload.single("file"),
	notificationsController.sendNotification
);
module.exports = router;
