const express = require("express");
const banksController = require("./../controllers/banksController");
// const authController = require("../controllers/authController");
const router = express.Router();
router.route("").post(banksController.addBank).get(banksController.getAllBanks);

router
	.route("/:id")
	.patch(banksController.updateBank)
	.delete(banksController.deleteBank);
module.exports = router;
