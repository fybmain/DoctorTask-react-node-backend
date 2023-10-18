// app/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/doctor/login", userController.doctorLogin);
router.post("/patient/login", userController.patientLogin);

router.get("/", userController.getAllUsers);
router.get("/patients", userController.getAllPatients);


module.exports = router;

