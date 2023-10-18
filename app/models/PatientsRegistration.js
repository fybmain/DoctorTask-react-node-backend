
module.exports = (sequelize, Sequelize) => {
  const PatientsRegistration = sequelize.define("PatientsRegistration", {
    FName: {
      type: Sequelize.STRING,
    },
    MName: {
      type: Sequelize.STRING,
    },
    LName: {
      type: Sequelize.STRING,
    },
    Age: {
      type: Sequelize.INTEGER,
    },
    Username: {
      type: Sequelize.STRING,
      field: 'uuid',
    },
    Password: {
      type: Sequelize.STRING,
      field: 'password',
    },
    // Define other fields here
  },{
    tableName: 'patients_registration',
    timestamps: false,
  });
  return PatientsRegistration;
};
