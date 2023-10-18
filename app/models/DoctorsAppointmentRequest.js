
module.exports = (sequelize, Sequelize) => {
    const DoctorsAppointmentRequest = sequelize.define("DoctorsAppointmentRequest", {
      Patient: {
        type: Sequelize.INTEGER,
        field: 'patient',
      },
      TimeSegment:{
        type: Sequelize.INTEGER,
        field: 'time_segment',
      },
      Status:{
        type: Sequelize.INTEGER,
        field: 'status',
      },
      Description:{
        type: Sequelize.TEXT,
        field: 'description',
      },
    },{
        tableName: 'doctors_appointment_requests',
        timestamps: false,
    });
    return DoctorsAppointmentRequest;
  };
  