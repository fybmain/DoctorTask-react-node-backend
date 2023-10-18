
module.exports = (sequelize, Sequelize) => {
    const DoctorsRegistration = sequelize.define("DoctorsRegistration", {
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
        tableName: 'doctors_registration',
        timestamps: false,
    });
    return DoctorsRegistration;
  };
  