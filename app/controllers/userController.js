const dbConfig = require("../config/db.config");
const db = require("../../db");
const { QueryTypes } = require("sequelize");

const generateUserToken = (type, username) => {
  return JSON.stringify({ Type: type, Username: username });
};

exports.parseUserToken = async (token) => {
  const parsed = JSON.parse(token);
  let user;
  if(parsed.Type === 'Doctor'){
    user = await db.DoctorsRegistration.findOne({ where: { Username: parsed.Username } });
  }else if(parsed.Type === 'Patient' ){
    user = await db.PatientsRegistration.findOne({ where: { Username: parsed.Username } });
  }else{
    throw('UndefinedUserType');
  }
  if(user===null){
    throw('UnknownUsername');
  }
  return { Type: parsed.Type, Username: parsed.Username, user};
};

exports.doctorLogin = async (req, res) => {
  try {
    const user = await db.DoctorsRegistration.findOne({ where: { Username: req.body.Username } });
    if(user === null){
      res.json({ status: 'UserNotExist'});
      return;
    }
    if(req.body.Password === user.Password){
      res.json({ status: 'OK', type: 'Doctor', token: generateUserToken('Doctor', user.Username) });
    }else{
      res.json({ status: 'PasswordMismatch' });
    }
  } catch (error) {
    console.error("Error user login:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientLogin = async (req, res) => {
  try {
    const user = await db.PatientsRegistration.findOne({ where: { Username: req.body.Username } });
    if(user === null){
      res.json({ status: 'UserNotExist'});
      return;
    }
    if(req.body.Password === user.Password){
      res.json({ status: 'OK', type: 'Patient', token: generateUserToken('Patient', user.Username) });
    }else{
      res.json({ status: 'PasswordMismatch' });
    }
  } catch (error) {
    console.error("Error user login:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const tables = await db.sequelize.query(
      "SHOW TABLES",
      { type: QueryTypes.SHOWTABLES, database: dbConfig.DB }
    );
    //console.log("tables:", tables);
    res.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllPatients = async (req, res) => {
  console.log("pateints")

  try {
    const patients = await db.sequelize.query(
      "SELECT * FROM patients_registration",
      { type: QueryTypes.SELECT }
    );
    //console.log("pateints",patients)
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
