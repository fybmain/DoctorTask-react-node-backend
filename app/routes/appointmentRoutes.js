const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

router.post("/doctorGetCalendar", appointmentController.doctorGetCalendar)
router.post("/patientGetCalendar", appointmentController.patientGetCalendar)
router.post("/getTimeSegmentDetail", appointmentController.getTimeSegmentDetail)
router.post("/doctorCreateAvailableTimeSegment", appointmentController.doctorCreateAvailableTimeSegment)
router.post("/doctorApproveRequest", appointmentController.doctorApproveRequest)
router.post("/patientSearchForTimeSegments", appointmentController.patientSearchForTimeSegments)
router.post("/patientBookTime", appointmentController.patientBookTime)
router.post("/getPatients", appointmentController.getPatients)
router.post("/cancelAppointmentRequest", appointmentController.cancelAppointmentRequest)

module.exports = router;
