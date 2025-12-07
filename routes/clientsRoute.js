const express = require("express");
const clientController = require("./../controllers/clientController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.get(clientController.getAllClients)
	.post(clientController.addClient);
router.route("/:id").delete(clientController.deleteClient);

router.route("/station/:stationId").get(clientController.getClientsByStationId);
module.exports = router;
