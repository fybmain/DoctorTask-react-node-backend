module.exports = (sequelize, Sequelize) => {
  const DoctorTask = sequelize.define(
    "DoctorTask",
    {
      Type: {
        type: Sequelize.TINYINT,
        field: 'type',
      },
      Doctor: {
        type: Sequelize.INTEGER,
        field: 'doctor',
      },
      Patient: {
        type: Sequelize.INTEGER,
        field: 'patient',
      },
      Status: {
        type: Sequelize.TINYINT,
        field: 'status',
      },
      BookCount: {
        type: Sequelize.INTEGER,
        field: 'book_count',
      },
      Start: {
        type: Sequelize.DATE,
        field: 'start',
      },
      End: {
        type: Sequelize.DATE,
        field: 'end',
      },
      Description: {
        type: Sequelize.TEXT,
        field: 'description',
      },
    },
    {
      tableName: 'doctor_tasks',
      timestamps: false,
    }
  );

  return DoctorTask;
};
