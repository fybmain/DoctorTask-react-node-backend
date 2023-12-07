// app/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const login = require('../controllers/login')
const patientRegistration = require('../controllers/PatientRegistration')
const doctorRegistration = require('../controllers/DoctorRegistration')
const hospitalAdminRegistration = require('../controllers/HospitalAdminRegistration')
const labAdminRegistration = require('../controllers/LabAdminRegistration')
const labApp = require('../controllers/LabApp')
const userController = require("../controllers/userController");
const contactController = require("../controllers/contactController");
const activeOnlineUser = require("../controllers/ActiveOnlineUser");
const inactiveUser = require("../controllers/InactiveUser");
const db = require('../../db_login');
const specialitiesController = require("../controllers/specialitiesController");
const TasksController = require("../controllers/TasksController");

router.get("/", userController.getAllUsers);
router.get("/patients", userController.getAllPatients);
router.post("/login",(req,res) =>{login.handelLogin(req,res,db,bcrypt)})
router.post("/PatientRegistration",(req,res) =>{patientRegistration.handelSubmit(req,res,db,bcrypt)})
router.post("/DoctorRegistration",(req,res) =>{doctorRegistration.handelSubmit(req,res,db,bcrypt)})
router.post("/HospitalAdminRegistration",(req,res) =>{hospitalAdminRegistration.handelSubmit(req,res,db,bcrypt)})
router.post("/LabAdminRegistration",(req,res) =>{labAdminRegistration.handelSubmit(req,res,db,bcrypt)})
router.post("/LabApp",(req,res) =>{labApp.handelSubmit(req,res,db,bcrypt)})
router.post("/activeOnlineUser",(req,res) =>{activeOnlineUser.handelSubmit(req,res,db)})
router.post("/inactiveUser",(req,res) =>{inactiveUser.handelSubmit(req,res,db)})
router.get("/specialities", specialitiesController.getAllSpecialities);
router.get("/contact", contactController.getContactUs);
router.get("/reviews", contactController.getReviews);
router.get("/doctorhelp", contactController.getDocHelp);
router.get("/clinichelp", contactController.getClinicHelp);
router.get("/joinus", contactController.getJoinUs);
router.get("/doctaskStaff", contactController.getDocTaskStaff);
router.get("/patientMessageStaff", contactController.getPatientMessageStaff);
router.get("/tasks", TasksController.getAllTasks);
router.get("/tasks/:id", TasksController.getTaskByPatientDetails);
router.get("/tasks/:FName", TasksController.getTaskByPatientDetails);
router.post("/tasks/add", TasksController.createTask);
router.put("/tasks/:id", TasksController.updateTask);
router.delete("/tasks/:id", TasksController.deleteTask);

module.exports = router;
