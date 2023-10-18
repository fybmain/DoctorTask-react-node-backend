const db = require("../../db");
const { Op } = require("sequelize");

const { parseUserToken } = require("./userController");

exports.patientGetAvailableDoctors = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const timesegments = await db.DoctorsAvailableTimeSegment.findAll({
      where: {
        Status: { [Op.gte]: 0 },
        Start: { [Op.gte]: req.body.Start },
        End: { [Op.lte]: req.body.End },
      },
    });

    //console.log(JSON.stringify(timesegments));
    res.json({ status: 'OK', result: JSON.parse(JSON.stringify(timesegments)) });
  } catch (error) {
    console.error("Error doctorGetAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorGetAvailableTimeSegments = async (req, res) => {
  try {
    console.log(req.body);
    const { user } = await parseUserToken(req.body.token);
    const timesegments = await db.DoctorsAvailableTimeSegment.findAll({
      where: {
        Doctor: user.id,
        Start: { [Op.gte]: req.body.Start },
        End: { [Op.lte]: req.body.End },
      },
    });

    //console.log(JSON.stringify(timesegments));
    res.json({ status: 'OK', result: JSON.parse(JSON.stringify(timesegments)) });
  } catch (error) {
    console.error("Error doctorGetAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorCreateAvailableTimeSegment = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const timesegment = db.DoctorsAvailableTimeSegment.build({
      Doctor: user.id,
      Status: 0,
      Start: req.body.Start,
      End: req.body.End,
      Description: req.body.Description,
    });

    await timesegment.save();
    res.json({ status: 'OK', result: timesegment.id });
  } catch (error) {
    console.error("Error doctorCreateAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

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

exports.doctorGetAppointmentRequests = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const requests = await db.DoctorsAppointmentRequest.findAll({
      where: {
        TimeSegment: req.body.TimeSegment,
      },
    });

    res.json({ status: 'OK', result: JSON.parse(JSON.stringify(requests)) });
  } catch (error) {
    console.error("Error doctorGetAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorApproveAppointmentRequest = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const request = await db.DoctorsAppointmentRequest.findOne({
      where: {
        id: req.body.id,
      },
    });
    request.Status = 1;
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: { id: request.TimeSegment },
    });
    timesegment.Status = -1;
    await request.save();
    await timesegment.save();

    res.json({ status: 'OK' });
  } catch (error) {
    console.error("Error doctorApproveAppointmentRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.createAppointmentRequest = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const request = db.DoctorsAppointmentRequest.build({
      Patient: user.id,
      TimeSegment: req.body.TimeSegment,
      Status: 0,
      Description: req.body.Description,
    });
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: { id: request.TimeSegment },
    });
    if(timesegment.Status<0){
      res.json({ status: 'AlreadyBooked'});
      return;
    }
    timesegment.Status += 1;

    await request.save();
    await timesegment.save();
    res.json({ status: 'OK', result: request.id });
  } catch (error) {
    console.error("Error createAppointmentRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.getAppointmentRequests = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const requests = await db.DoctorsAppointmentRequest.findAll({
      where: {
        Patient: user.id,
      },
    });

    res.json({ status: 'OK', result: JSON.parse(JSON.stringify(requests)) });
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
