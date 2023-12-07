const db = require("../../db");
const { Op, QueryTypes } = require("sequelize");

exports.getPatients = async (req, res) => {
  try {
    const { loginData } = req.body;
    const result = await db.sequelize.query("SELECT patient_id AS id, (SELECT concat_ws(' ', FName, MName, LName) FROM patients_registration as tp WHERE tp.id=t1.patient_id) AS name FROM doctor_recordauthorized AS t1 WHERE doctor_id=$id", {
      bind: { id: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result });
  } catch (error) {
    console.error("Error getPatients:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorGetCalendar = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const result = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName FROM doctor_tasks AS t1 WHERE doctor=$doctor AND start<=$end AND end>=$start", {
      bind: { start, end, doctor: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: result.map((record) => ({
      ...record,
      doctor: { id: record.doctor, name: record.doctorName },
    }))});
  } catch (error) {
    console.error("Error doctorGetCalendar:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientGetCalendar = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const result = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName, (SELECT status FROM doctor_appointment_requests AS tr WHERE tr.patient=$patient_id AND tr.task=t1.id) AS appointmentStatus FROM doctor_tasks AS t1 WHERE type=2 AND start<=$end AND end>=$start AND EXISTS (SELECT 1 FROM doctor_recordauthorized AS ta WHERE ta.doctor_id=t1.doctor AND ta.patient_id=$patient_id)", {
      bind: { start, end, patient_id: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: result.map((record) => ({
      ...record,
      doctor: { id: record.doctor, name: record.doctorName },
    }))});
  } catch (error) {
    console.error("Error patientGetCalendar:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.getTimeSegmentDetail = async (req, res) => {
  try {
    const { loginData, id } = req.body;
    const task = (await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName FROM doctor_tasks AS t1 WHERE id=$id", {
      bind: { id },
      type: QueryTypes.SELECT,
    }))[0];
    console.log(task);
    const requests = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', FName, MName, LName) FROM patients_registration as tp WHERE tp.id=t1.patient) AS patientName FROM doctor_appointment_requests AS t1 WHERE task=$task_id", {
      bind: { task_id: task.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: {
      ...task,
      requests: requests.map((record) => ({
        ...record,
        patient: { id: record.patient, name: record.patientName },
      })),
    }});
  } catch (error) {
    console.error("Error getTimeSegmentDetail:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorCreateAvailableTimeSegment = async (req, res) => {
  try {
    const { loginData, start, end, description } = req.body;
    const task = db.DoctorTask.build({
      Type: 2,
      Doctor: loginData.id,
      Patient: null,
      Status: 0,
      BookCount: 0,
      Start: start,
      End: end,
      Description: description,
    });

    await task.save();

    res.json({ status: 'OK', result: task.id });
  } catch (error) {
    console.error("Error doctorCreateAvailableTimeSegment:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorApproveRequest = async (req, res) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const { loginData, id } = req.body;
      const request = await db.DoctorAppointmentRequest.findOne({
        where: { id },
        transaction: t,
      });
      if(request.Status !== 0){
        throw new Error('Not Approvable');
      }
      request.Status = 1;

      const task = await db.DoctorTask.findOne({
        where: { id: request.Task },
        transaction: t,
      });
      task.Status = -1;
      await task.save({transaction: t});
  
      const requests = await db.DoctorAppointmentRequest.update({ Status: -1 }, {
        where: {
          Task: { [Op.eq]: request.Task },
          id: { [Op.ne]: request.id },
        },
        transaction: t,
      });

      await request.save({transaction: t});
      res.json({ status: 'OK' });
    });
  } catch (error) {
    console.error("Error doctorApproveRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientSearchForTimeSegments = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const result = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName, (SELECT status FROM doctor_appointment_requests AS tr WHERE tr.patient=$patient_id AND tr.task=t1.id) AS appointmentStatus FROM doctor_tasks AS t1 WHERE type=2 AND start<=$end AND end>=$start AND EXISTS (SELECT 1 FROM doctor_recordauthorized AS ta WHERE ta.doctor_id=t1.doctor AND ta.patient_id=$patient_id)", {
      bind: { start, end, patient_id: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: result.map((record) => ({
      ...record,
      doctor: { id: record.doctor, name: record.doctorName },
    }))});
  } catch (error) {
    console.error("Error patientSearchForTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientBookTime = async (req, res) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const { loginData, id, description } = req.body;
      const task = await db.DoctorTask.findOne({
        where: { id: id },
        transaction : t,
      });
      if(task.Status < 0){
        res.json({ status: 'AlreadyBooked'});
        throw new Error('AlreadyBooked');
      }
      task.increment('Status', { by: 1, transaction: t});
      task.increment('BookCount', { by: 1, transaction: t});

      const request = db.DoctorAppointmentRequest.build({
        Patient: loginData.id,
        Task: task.id,
        Status: 0,
        Description: description,
      });
      await request.save({transaction: t});

      res.json({ status: 'OK', result: request.id });
    });
  } catch (error) {
    console.error("Error patientBookTime:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

/*
exports.doctorDeleteAvailableTimeSegment = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: {
        id: req.body.id,
        Doctor: user.id,
      },
    });
    await timesegment.destroy();

    res.json({ status: 'OK' });
  } catch (error) {
    console.error("Error doctorGetAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.updateAppointmentRequest = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const request = await db.DoctorsAppointmentRequest.findOne({
      where: {
        id: req.body.id,
      },
    });
    request.Status = -1;
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: { id: request.TimeSegment },
    });
    timesegment.Status -= 1;
    await request.save();
    await timesegment.save();

    res.json({ status: 'OK' });
  } catch (error) {
    console.error("Error updateAppointmentRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};
*/
