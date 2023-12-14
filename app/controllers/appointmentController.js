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
    const timeSegments = (await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName FROM doctor_available_time_segments AS t1 WHERE doctor=$doctor AND start<=$end AND end>=$start", {
      bind: { start, end, doctor: loginData.id },
      type: QueryTypes.SELECT,
    })).map((record) => ({
      ...record,
      type: 2,
      doctor: { id: record.doctor, name: record.doctorName },
    }));
    const tasks = (await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName FROM doctor_tasks AS t1 WHERE doctor=$doctor AND start<=$end AND end>=$start", {
      bind: { start, end, doctor: loginData.id },
      type: QueryTypes.SELECT,
    })).map((record) => ({
      ...record,
      type: 1,
      doctor: { id: record.doctor, name: record.doctorName },
    }));

    res.json({ status: 'OK', result: timeSegments.concat(tasks) });
  } catch (error) {
    console.error("Error doctorGetCalendar:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientGetCalendar = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const result = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName, (SELECT status FROM doctor_appointment_requests AS tr WHERE tr.patient=$patient_id AND tr.time_segment=t1.id) AS appointmentStatus, (SELECT description FROM doctor_appointment_requests AS tr WHERE tr.patient=$patient_id AND tr.time_segment=t1.id) AS patientDescription FROM doctor_available_time_segments AS t1 WHERE start<=$end AND end>=$start AND EXISTS (SELECT 1 FROM doctor_recordauthorized AS ta WHERE ta.doctor_id=t1.doctor AND ta.patient_id=$patient_id)", {
      bind: { start, end, patient_id: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: result.map((record) => ({
      ...record,
      type: 2,
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
    const timeSegment = (await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName FROM doctor_available_time_segments AS t1 WHERE id=$id", {
      bind: { id },
      type: QueryTypes.SELECT,
    }))[0];
    console.log(timeSegment);
    const requests = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', FName, MName, LName) FROM patients_registration as tp WHERE tp.id=t1.patient) AS patientName FROM doctor_appointment_requests AS t1 WHERE time_segment=$time_segment_id", {
      bind: { time_segment_id: timeSegment.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: {
      ...timeSegment,
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
    const timeSegment = db.DoctorAvailableTimeSegment.build({
      Doctor: loginData.id,
      Patient: null,
      Status: 0,
      BookCount: 0,
      Start: start,
      End: end,
      Description: description,
    });

    await timeSegment.save();

    res.json({ status: 'OK', result: timeSegment.id });
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

      const timeSegment = await db.DoctorAvailableTimeSegment.findOne({
        where: { id: request.TimeSegment },
        transaction: t,
      });
      timeSegment.Status = -1;
      await timeSegment.save({transaction: t});
  
      const requests = await db.DoctorAppointmentRequest.update({ Status: -1 }, {
        where: {
          TimeSegment: { [Op.eq]: request.TimeSegment },
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
    const result = await db.sequelize.query("SELECT *, (SELECT concat_ws(' ', Fname, Mname, Lname) FROM doctors_registration as td WHERE td.id=t1.doctor) AS doctorName, (SELECT status FROM doctor_appointment_requests AS tr WHERE tr.patient=$patient_id AND tr.time_segment=t1.id) AS appointmentStatus FROM doctor_available_time_segments AS t1 WHERE start<=$end AND end>=$start AND EXISTS (SELECT 1 FROM doctor_recordauthorized AS ta WHERE ta.doctor_id=t1.doctor AND ta.patient_id=$patient_id)", {
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
      const timeSegment = await db.DoctorAvailableTimeSegment.findOne({
        where: { id: id },
        transaction : t,
      });
      if(timeSegment.Status < 0){
        res.json({ status: 'AlreadyBooked'});
        throw new Error('AlreadyBooked');
      }
      await timeSegment.update({ Status: 1 }, { transaction: t });
      await timeSegment.increment('BookCount', { by: 1, transaction: t });

      const request = db.DoctorAppointmentRequest.build({
        Patient: loginData.id,
        TimeSegment: timeSegment.id,
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
*/

exports.cancelAppointmentRequest = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      const { loginData, id } = req.body;
      const timeSegment = await db.DoctorAvailableTimeSegment.findOne({
        where: { id },
        transaction : t,
      });
      const request = await db.DoctorAppointmentRequest.findOne({
        where: {
          TimeSegment: timeSegment.id,
          patient: loginData.id,
        },
        transaction : t,
      });

      await timeSegment.decrement('BookCount', { by: 1, transaction: t });
      if(timeSegment.BookCount > 1){
        await timeSegment.update({ Status: 1 }, { transaction: t });
      }else{
        await timeSegment.update({ Status: 0 }, { transaction: t });
      }

      if(request.Status === 1){
        await db.DoctorAppointmentRequest.update({ Status: 0 }, {
          where: {
            TimeSegment: { [Op.eq]: request.TimeSegment },
            id: { [Op.ne]: request.id },
          },
          transaction: t,
        });
      }
      await request.destroy({ transaction: t });
      await timeSegment.save({ transaction: t });

      res.json({ status: 'OK' });
    });
  } catch (error) {
    console.error("Error cancelAppointmentRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};
