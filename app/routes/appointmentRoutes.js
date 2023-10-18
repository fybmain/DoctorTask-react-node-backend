// app/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

/*
router.get("/doctor/appointments", appointmentController.doctorGetAppointments);
router.get("/patient/appointments", appointmentController.patientGetAppointments);
*/

router.get("/available_doctors", appointmentController.patientGetAvailableDoctors);

router.get("/doctor/available_time_segments", appointmentController.doctorGetAvailableTimeSegments);
router.post("/doctor/available_time_segments", appointmentController.doctorCreateAvailableTimeSegment);
router.delete("/doctor/available_time_segments", appointmentController.doctorDeleteAvailableTimeSegment);

router.get("/doctor/appointment_requests", appointmentController.doctorGetAppointmentRequests);
router.put("/doctor/appointment_requests", appointmentController.doctorApproveAppointmentRequest);

router.post("/appointment_requests", appointmentController.createAppointmentRequest);
router.get("/appointment_requests", appointmentController.getAppointmentRequests);
router.put("/appointment_requests", appointmentController.updateAppointmentRequest);

module.exports = router;
