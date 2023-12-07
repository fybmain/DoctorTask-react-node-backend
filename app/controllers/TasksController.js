
const db = require("../../db");
const { Op, QueryTypes } = require("sequelize");

const DoctorTask = db.DoctorTask;

/*
const getPatientName = async (patientId) => {
  return (await db.sequelize.query("SELECT concat_ws(' ', FName, MName, LName) AS patientName FROM patients_registration as td WHERE td.id=$id", {
    bind: { id: patientId },
    type: QueryTypes.SELECT,
  })).patientName;
}

// Find all task, good
exports.getAllTasks = async (req, res) => {
  const { filter } = req.query;

  // Add condition based on the filter option
  const currentDate = new Date();
  let whereCondition;
  if (filter === 'today') {
    whereCondition = {
      start: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      end: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000),
    };
  } else if (filter === 'week') {
    whereCondition = {
      start: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  } else {
    whereCondition = {};
  }

  try{
    const data = await DoctorTask.findAll({
      // Include the where condition here
      where: {
        ...whereCondition,
        Type: 1,
      },
    });

    res.send(data.map((record) => ({
      ...record,
      Patient: getPatient(data.Patient),
    }));

    .catch((err) => {
      res.status(400).send({
        message: err.message || `Some error occurred while retrieving tasks.`,
      });
    });
*/

// Query specific task, good
exports.getTaskByPatientDetails = (req, res) => {
  DoctorTask.findOne({ 
    where: { 
      id: req.params.id,
     }
   })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send({
        message: `Error retrieving Tasks with the given details.`,
      });
    });
};

// Create a new task,good
exports.createTask = (req, res) => {
  console.log(req.body);

  // Create a task then save it in the database
  const task = {
    Type: 1,
    Doctor: req.body.Doctor,
    Patient: req.body.Patient,
    Status: 0,
    BookCount: 0,
    Start: req.body.Start,
    End: req.body.End,
    Description: req.body.Description,
  };

  // Save task in the database
  DoctorTask.create(task)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({
        message: `Some error occurred while creating the Task.`,
      });
    });
};

// Update task
exports.updateTask = (req, res) => {
  DoctorTask.update(req.body,{ where: { 
    id: req.params.id,
    } })
    .then((result) => {
      if (result.nModified > 0) {
        res.send({
          message: `${result.nModified} task(s) were updated successfully.`,
        });
      } else {
        res.send({
          message: `!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: `Error updating task`,
      });
    });
};

// Delete task,good
exports.deleteTask = (req, res) => {
  const id = req.params.id;
  DoctorTask.destroy({ where: { 
    id,
   } })
    .then((data) => {
      if (data) {
        res.send({
          message: `Task was deleted successfully!`,
        });
      } else {
        res.send({
          message: `Cannot delete Task with id=${id}. Maybe Task was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: `Could not delete Task with id=${id}`,
      });
    });
};
