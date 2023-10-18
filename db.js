// db.js
const { Sequelize } = require("sequelize");
const dbConfig = require("./app/config/db.config");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT,
    operatorsAliases: false,
    
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.PatientsRegistration = require("./app/models/PatientsRegistration")(sequelize, Sequelize);
db.DoctorsRegistration = require("./app/models/DoctorsRegistration")(sequelize, Sequelize);
db.DoctorsAvailableTimeSegment = require("./app/models/DoctorsAvailableTimeSegment")(sequelize, Sequelize);
db.DoctorsAppointmentRequest = require("./app/models/DoctorsAppointmentRequest")(sequelize, Sequelize);


module.exports = db;
