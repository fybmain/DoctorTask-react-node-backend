// config/db.config.js
module.exports = {
  HOST: "192.168.100.122",
  USER: "root",
  PASSWORD: "my-secret-pw",
  DB: "doctor",
  PORT: 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
