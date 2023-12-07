const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./app/routes/userRoutes");
const appointmentRoutes = require('./app/routes/appointmentRoutes');
const diagnostic = require('./app/controllers/diagnostic');
const chatRoutes = require("./app/routes/chatRouter");
const session = require('express-session');

const expressWs = require('express-ws');
const multer = require('multer');
var jsonParser = bodyParser.json();

const corsOptions = {
  //origin: 'https://e-react-frontend-55dbf7a5897e.herokuapp.com',
  origin: "*", // Replace with your local React server's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
var mysql = require("./app/models/dbConnection");
const db = require("./db"); 

var models = require('./app/models/commonMethod');
const mongodbConfig = require("./app/config/mongodb.config");
const uri = mongodbConfig.uri;
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);
app.use(cors(corsOptions));
expressWs(app);

app.use(session({
  secret: 'eHospital', 
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge:1000*3600,
    secure:false
  }
}));

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/appointments", appointmentRoutes); // Mount user routes
app.use("/api/diagnostic", diagnostic);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Move the root route handler outside the database connection block
app.get("/", (req, res) => {
  res.send("Welcome to your server!");
});

app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/chat",chatRoutes);

//New Api's start from here


//shake waseef code 
app.get("/skinCancerData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("Skin_Images");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.get("/skinDiseasesData/:id", async (req, res) =>
{
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("Skin_Diseases");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
})

app.post("/skinCancerData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("Skin_Images");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});

app.post("/skinDiseasesData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("Skin_Diseases");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});


//Adeeb's code

app.get("/pneumoniaData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("X-Ray_Chest");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.post("/pneumoniaData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("X-Ray_Chest");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});

// Bone cancer code

app.get("/boneData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("X-Ray_Feet");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.post("/boneData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("X-Ray_Feet");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});



app.post("/searchpatient", (req, res) => {
  const phoneNumber = req.body.phoneNumber; // patient phone number, e.g. "6131230000"
  //console.log("in node searchpatient post api you searched for ",phoneNumber);
  // Check patient identity
  if (!phoneNumber) {
    res.send({ error: "Missing patient phone number" });
    return;
  }
  var patient_id = 0;
  var check_list = [];
  let sqlDB = mysql.connect();
  sql = `
      SELECT *
      FROM patients_registration 
      WHERE MobileNumber = "${phoneNumber}"
  `;
  console.log(sql);
  sqlDB.query(sql, (error, result) => {
    if (error) {
      res.send({ error: "Something wrong in MySQL." });
      console.log("Something wrong in MySQL");
      sqlDB.end();
      return;
    }
    if (result.length != 1) {
      check_list[0] = 1;
      // res.render('pages/searchpatient', {check:check_list});
      res.send({ error: "No patient matched in database." });

      return;
    }
    patient_id = result[0].id;
    sql_search_query = `SELECT * FROM patients_registration WHERE id = "${patient_id}"`;
    let sqlDB = mysql.connect();
    sqlDB.query(sql_search_query, function (err, result) {
      if (err) throw err;

      ///res.render() function
      // res.send(result.id);
      res.json(result[0]);
      console.log(result[0]);
    });
    sqlDB.end();

    //console.log(sql_search_query);
  });
  sqlDB.end();
});

// This is the API for retrieving image from MongoDB by patient phone number
app.post("/imageRetrieveByPhoneNumber", async (req, res) => {
  const phoneNumber = req.body.phoneNumber; // patient phone number, e.g. "6131230000"
  const recordType = req.body.recordType; // the record type, e.g. "X-Ray", this represents the collection in the database (case sensitive)

  // Check parameters
  if (!phoneNumber) {
    res.send({ error: "Missing patient phone number." });
    console.log("Missing patient phone number.");
    return;
  }
  if (!recordType) {
    res.send({ error: "Missing record type." });
    console.log("Missing record type.");

    return;
  }

  // Execute query
  sql = `SELECT id FROM patients_registration WHERE MobileNumber = "${phoneNumber}"`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }

  // Check patient result
  if (result.length != 1) {
    res.send({ error: "No patient matched in database." });
    console.log("No patient matched in database.");
    return;
  }

  let patient_id = result[0].id;

  const MongoResult = await models.imageRetrieveByPatientId(
    patient_id,
    recordType
  );
  res.send(MongoResult);
});

// This is the API for retrieving image from MongoDB by record id
app.post("/imageRetrieveByRecordId", async (req, res) => {
  const _id = req.body._id; // record id, e.g. "640b68a96d5b6382c0a3df4c"
  const recordType = req.body.recordType; // the record type, e.g. "X-Ray", this represents the collection in the database (case sensitive)

  // Check parameters
  if (!_id) {
    res.send({ error: "Missing record id." });
    return;
  }
  if (!recordType) {
    res.send({ error: "Missing record type." });
    return;
  }

  const MongoResult = await models.imageRetrieveByRecordId(_id, recordType);
  res.send(MongoResult);
});

// This API is for updating the ML prediction result to the database.
app.post("/updateDisease", async (req, res) => {
  const phoneNumber = req.body.phoneNumber; // the patient phone number, e.g. "6131230000" also we can use 6131230016
  const disease = req.body.disease; // the name of the disease, e.g. "pneumonia"
  const date = req.body.date; // the prediction date, e.g. "2023-03-01 09:00:00"
  const prediction = req.body.prediction; // the prediction result, "1" if disease, "0" otherwise
  const description = req.body.description; // more description of this disease, like the subtype of this disease.
  const accuracy = req.body.accuracy; // prediction accuracy, e.g. "90%"
  const recordType = req.body.recordType; // the type of the health test, e.g. "X-Ray" or "ecg"
  const recordId = req.body.recordId; // the id of the health test, e.g. "12", "640b68a96d5b6382c0a3df4c"

  if (!phoneNumber || !disease || !date || !description) {
    res.send({
      error: "Missing patient phone number, disease, date, or prediction.",
    });
    return;
  }

  // Execute query
  sql = `SELECT id FROM patients_registration WHERE MobileNumber = "${phoneNumber}"`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }

  // Check patient result;
  if (result.length != 1) {
    res.send({ error: "No patient matched in database." });
    return;
  }

  let patient_id = result[0].id;

  // Execute query
  sql = `INSERT into ${disease} (patient_id, prediction_date, prediction, description, accuracy, record_type, record_id)
  VALUES (${patient_id}, "${date}", "${prediction}", ${
    description ? '"' + description + '"' : "NULL"
  }, ${accuracy ? '"' + accuracy + '"' : "NULL"}, ${
    recordType ? '"' + recordType + '"' : "NULL"
  }, ${recordId ? '"' + recordId + '"' : "NULL"})
  ON DUPLICATE KEY 
  UPDATE prediction_date = "${date}", 
  prediction = "${prediction}",
  description = ${description ? '"' + description + '"' : "NULL"},
  accuracy = ${accuracy ? '"' + accuracy + '"' : "NULL"},
  record_type = ${recordType ? '"' + recordType + '"' : "NULL"},
  record_id = ${recordId ? '"' + recordId + '"' : "NULL"};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Submit success." });
});
//--
//API to get physicaltestckdata by patient_id
app.post("/getPhysicaltestCK", async (req, res) => {
  const patientID = req.body.patientId; //patient ID
  if (!patientID) {
    res.send({ error: "Missing patient ID." });
    console.log("Missing patient ID.");
    return;
  }
  // Execute query
  sql = `SELECT * FROM physical_test_ck
            WHERE patient_id = "${patientID}" 
            order by RecordDate desc limit 1`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  // Check patient result
  if (result.length <= 0) {
    console.log("No patient matched in database.");
    res.send({ error: "No patient matched in database." });
    return;
  }
  const response_for_request = {
    record_id: result[0].id,
    record_date: result[0].RecordDate,
    data: [
      result[0].age,
      result[0].blood_pressure,
      result[0].specific_gravity,
      result[0].albumin,
      result[0].sugar,
      result[0].red_blood_cells,
      result[0].pus_cell,
      result[0].pus_cell_clumps,
      result[0].bacteria,
      result[0].blood_glucose_random,
      result[0].blood_urea,
      result[0].serum_creatinine,
      result[0].sodium,
      result[0].potassium,
      result[0].haemoglobin,
      result[0].packed_cell_volume,
      result[0].white_blood_cell_count,
      result[0].red_blood_cell_count,
      result[0].hypertension,
      result[0].diabetes_mellitus,
      result[0].coronary_artery_disease,
      result[0].appetite,
      result[0].peda_edema,
      result[0].aanemia,
    ],
  };
  console.log(response_for_request);
  res.json(response_for_request);
});
//----
//top_five_recent_patients_per_doctor
app.post("/TopFiveRecentPatients", async (req, res) => {
 // console.log("got here here");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `SELECT P.id, 
                P.Fname AS PatientFName, 
                P.LName AS PatientLName, 
                DSRecent.service_date
                FROM patients_registration AS P
                JOIN (
                SELECT DS.patient_id, 
                      MAX(DS.service_date) AS service_date
                FROM doctor_servicehistory AS DS
                WHERE DS.doctor_id = "${doctorID}"
                GROUP BY DS.patient_id
                ORDER BY MAX(DS.service_date) DESC
                LIMIT 10
                ) AS DSRecent ON P.id = DSRecent.patient_id;
                `;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result);
}
)
//----
//Patients_authorized_per_doctor
app.post("/DoctorPatientsAuthorized", async (req, res) => {
  //console.log("docrecordauthorized");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `
          select DA.patient_id as id, P.FName, P.LName, P.MobileNumber, substr(P.MName,1,1) as MI, 
          P.Age, P.Gender, P.weight
          from  doctor_recordauthorized  as DA,  patients_registration as P
          where DA.doctor_id = "${doctorID}" and DA.patient_id = P.id;`;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result);
}
)
//---------------------Thyroid Disease API ------------------------
app.post("/getThyroidDiseaseData", async (req, res) => {
  const patientID = req.body.patientId; //patient ID
  if (!patientID) {
    res.send({ error: "Missing patient ID." });
    console.log("Missing patient ID.");
    return;
  }
  
  // Execute query
  let sql = `SELECT * FROM nkw2tiuvgv6ufu1z.thyroid_disease 
            WHERE id = "${patientID}" 
            order by id desc limit 1`;  // Assuming you have a field to order by. Adjust if needed.

  let result;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  
  // Check patient result
  if (result.length <= 0) {
    res.send({ error: "No patient matched in database." });
    console.log("No patient matched in database.");
    return;
  }
  
  const response_for_request = {
    record_id: result[0].id,
    data: {
      age: result[0].age,
      sex: result[0].sex,
      TSH: result[0].TSH,
      T3: result[0].T3,
      T4U: result[0].T4U,
      FTI: result[0].FTI,
      onthyroxine: result[0].onthyroxine,
      queryonthyroxine: result[0].queryonthyroxine,
      onantithyroidmedication: result[0].onantithyroidmedication,
      sick: result[0].sick,
      pregnant: result[0].pregnant,
      thyroidsurgery: result[0].thyroidsurgery,
      I131treatment: result[0].I131treatment,
      queryhypothyroid: result[0].queryhypothyroid,
      queryhyperthyroid: result[0].queryhyperthyroid,
      lithium: result[0].lithium,
      goitre: result[0].goitre,
      tumor: result[0].tumor,
      hypopituitary: result[0].hypopituitary,
      psych: result[0].psych,
      //result: result[0].result
    }
  };

  console.log(response_for_request);
  res.json(response_for_request);
});

//--- Important Info for doctor profile
//Patients_authorized_per_doctor
app.post("/DoctorProfileInfo", async (req, res) => {
  //console.log("docrecordauthorized");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `
    SELECT a.*, 
    COUNT(b.patient_id) AS active_patients
    FROM doctors_registration AS a
    JOIN doctor_recordauthorized AS b ON a.id = b.doctor_id
    WHERE a.id = ${doctorID} `;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result[0]);
}
)
//---Ending  DocProfile

//---------------------Breast cancer API start------------------------
app.post("/getBreastCancerData", (req, res) => {

  console.log(req)

  const patient_id = req.body.patient_id; // patient id, e.g. "133"

  // Check patient identity
  if (!patient_id) {
      res.send({ error: "Missing patient id" });
      return;
  }
  var check_list = [];
  let sqlDB = mysql.connect();
  sql = `
      SELECT *
      FROM breast_cancer_details 
      WHERE patient_id = "${patient_id}"
  `;
  console.log(sql);
  sqlDB.query(sql, (error, result) => {
      if (error) {
          res.send({ error: "Something wrong in MySQL." });
          console.log("Something wrong in MySQL");
          return;
      }
      if (result.length != 1) {
          check_list[0] = 1;
          res.send({ error: "No patient matched in database." });
          return;
      }

      res.json(result[0]);
      console.log(result[0]);
  });
  sqlDB.end();
});
//---------------------Breast cancer API end ------------------------
/**
 * Heart Stroke Data Endpoint
 **/
app.get('/heartstroke/:patientId', async (req, res, nxt) => {
  const { patientId } = req.params;

  strokesql = `SELECT * FROM heart_stroke
          WHERE patient_id = "${patientId}" 
          limit 1`;
      
  patientsql = `SELECT Gender as gender, Age as age FROM patients_registration
          WHERE id = "${patientId}" 
          limit 1`;

  let strokeData = null;
  let patientData = null;
  try {
      strokeData = await mysql.query(strokesql);
      patientData = await mysql.query(patientsql);
  } catch (error) {
      return res.status(500).send({ error: "Something wrong in MySQL" });
  }

  if (!strokeData || !patientData) {
      return res.status(404).send({ error: "No patient matched in database." });
  }
  
  return res.json({...strokeData[0], ...patientData[0]});
});

/**
 * Heart Stroke Data Endpoint ends
 **/
// -------------------Liver Preidiction API -------------------------//
app.post("/liver_disease", async (req, res) => {
    const patientID = req.body.patientId //patient ID
    if(!patientID) {
        res.send({ error: "Missing patient ID." });
        console.log("Missing patient ID.");
        return;
    }
     // Execute query
    sql = `SELECT * FROM liver_disease
            WHERE patients_id = "${patientID}" 
            order by recordtime desc limit 1`;

    try {
        result = await mysql.query(sql);
    } catch (error) {
      console.log(error,"Something wrong in MySQL---." );
      res.send({ error: "Something wrong in MySQL---." });
      return;
    }
      // Check patient result
    if (result.length <=0) {
        res.send({ error: "No patient matched in database." });
        console.log("No patient matched in database." );
        return;
    }
    const response_for_request =
    {   "record_id": result[0].patients_id,
        "record_date":result[0].recordtime,
        "data":
        [
            result[0].custom_age,
            result[0].Total_Bilirubin,
            result[0].Direct_Bilirubin,
            result[0].Alkaline_Phosphotase,
            result[0].Alamine_Aminotransferase,
            result[0].Aspartate_Aminotransferase,
            result[0].Total_Protiens,
            result[0].Albumin,
            result[0].Albumin_and_Globulin_Ratio,
            result[0].Gender_Female,
            result[0].Gender_Male,
        ]
    }
    console.log(response_for_request);
    res.json(response_for_request);
});


//-----------contact us API start---------------------
app.post("/contact", async (req, res) => {
  const { formData } = req.body
  const contact_name = formData.contactName.trim()
  const contact_phone = formData.contactPhone.trim()
  const contact_email = formData.contactEmail.trim()
  const contact_topic = formData.contactTopic.trim()
  const contact_message = formData.contactMessage.trim()
  const table_name = "contact_us";

  // Execute query
  sql = `INSERT into ${table_name} (contact_name, contact_phone, contact_email, contact_topic, contact_message, contact_reply)
  VALUES ("${contact_name}", "${contact_phone}", ${contact_email ? '"' + contact_email + '"' : "NULL"
    }, "${contact_topic}", ${contact_message ? '"' + contact_message + '"' : "NULL"
    }, 0)
  ON DUPLICATE KEY 
  UPDATE contact_name = "${contact_name}", 
  contact_phone = "${contact_phone}",
  contact_email = ${contact_email ? '"' + contact_email + '"' : "NULL"},
  contact_topic = ${contact_topic ? '"' + contact_topic + '"' : "NULL"},
  contact_message = ${contact_message ? '"' + contact_message + '"' : "NULL"},
  contact_reply = 0;`;
  try {
    result = await mysql.query(sql);
    /*
    //sending SMS message to remind using twilio.
    const accountSid = '';
    const authToken = '';
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: 'A new request is waiting for response, please check detail on the eHospital website.',
        from: '+',
        to: '+'
      })
      .then(message => console.log(message.sid))
      .done();
      */
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});


app.post("/contactCheck", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE contact_us SET contact_reply = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});

//------------contact us API end ---------------------



//-----------join us API start---------------------
app.post("/joinUs", async (req, res) => {
  const { formData } = req.body
  const fName = formData.fName.trim()
  const lName = formData.lName.trim()
  const Email = formData.Email.trim()
  const Phone = formData.Phone.trim()
  const Address = formData.Address.trim()
  const Specialty = formData.Specialty.trim()
  const License = formData.License.trim()
  const contactMessage = formData.contactMessage.trim()
  const table_name = "join_us_request";

  // Execute query
  sql = `INSERT into ${table_name} (fName, lName, phone, email, specialty, working_address,
    certificate_num, note, receive, verify)
  VALUES ("${fName}", "${lName}","${Phone}", ${Email ? '"' + Email + '"' : "NULL" },
   ${Specialty ? '"' + Specialty + '"' : "NULL"},
   ${Address ? '"' + Address + '"' : "NULL"},
   ${License ? '"' + License + '"' : "NULL"},
   ${contactMessage ? '"' + contactMessage + '"' : "NULL"},
   0, 0)
  ON DUPLICATE KEY 
  UPDATE fName = "${fName}", 
  lName = "${lName}",
  phone = "${Phone}",
  email = ${Email ? '"' + Email + '"' : "NULL"},
  specialty = ${Specialty ? '"' + Specialty + '"' : "NULL"},
  working_address = ${Address ? '"' + Address + '"' : "NULL"},
  certificate_num  = ${License ? '"' + License + '"' : "NULL"},
  note =  ${contactMessage ? '"' + contactMessage + '"' : "NULL"},
  receive = 0, verify = 0;`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});


app.post("/joinReceive", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE join_us_request SET receive = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});


app.post("/joinVerify", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE join_us_request SET verify = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});

//------------Join Us API end ---------------------




//-----------doctor help API start---------------------
app.post("/doctorhelp", async (req, res) => {
  const { formData } = req.body
  const help_name = formData.helpName.trim()
  const help_phone = formData.helpPhone.trim()
  const help_email = formData.helpEmail.trim()
  const help_message = formData.helpMessage.trim()
  const table_name = "doctors_help";

  // Execute query
  sql = `INSERT into ${table_name} (help_name, help_phone, help_email, help_message, help_reply)
  VALUES ("${help_name}", "${help_phone}", ${help_email ? '"' + help_email + '"' : "NULL"
    }, ${help_message ? '"' + help_message + '"' : "NULL"
    }, 0)
  ON DUPLICATE KEY 
  UPDATE help_name = "${help_name}", 
  help_phone = "${help_phone}",
  help_email = ${help_email ? '"' + help_email + '"' : "NULL"},
  help_message = ${help_message ? '"' + help_message + '"' : "NULL"},
  help_reply = 0;`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});


app.post("/dochelpCheck", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE doctors_help SET help_reply = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});

//------------doctor help API end ---------------------




//-----------staff tech support API start---------------------
app.post("/stafftechsupport", async (req, res) => {
  const { formData } = req.body
  const help_name = formData.helpName.trim()
  const help_phone = formData.helpPhone.trim()
  const help_email = formData.helpEmail.trim()
  const help_message = formData.helpMessage.trim()
  const table_name = "clinic_help";

  // Execute query
  sql = `INSERT into ${table_name} (help_name, help_phone, help_email, help_message, help_reply)
  VALUES ("${help_name}", "${help_phone}", ${help_email ? '"' + help_email + '"' : "NULL"
    }, ${help_message ? '"' + help_message + '"' : "NULL"
    }, 0)
  ON DUPLICATE KEY 
  UPDATE help_name = "${help_name}", 
  help_phone = "${help_phone}",
  help_email = ${help_email ? '"' + help_email + '"' : "NULL"},
  help_message = ${help_message ? '"' + help_message + '"' : "NULL"},
  help_reply = 0;`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});

app.post("/clinichelpCheck", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE clinic_help SET help_reply = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});


//------------staff tech support API end ---------------------

//------------doc task staff API start ---------------------

app.post("/doctaskCheck", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE doctor_task_request SET check_status = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});



app.post("/stafftopatientReply", async (req, res) => {

  const id = req.body.id;

  sql = `UPDATE message_pat_to_clinicalstaff SET check_status = 1 WHERE id = ${id};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });
});
//------------doc task staff API start ---------------------

//patient Overview data
app.post("/patientOverview", async (req, res) => {
  const patientID = req.body.patientId;
  let patientData, patientTreatment, online_status;
  if (!patientID ) {
    res.send({ error: "Missing Patient ID." });
    console.log("Missing Patient ID.");
    return;
  }
    //queries
  const sql_patient_data= `select * from patients_registration where id="${patientID}"`;       
  const sql_patient_treatment =`select * 
                          from patients_treatment 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_online_status= `select session_status 
                      from online_patients 
                      where online_patient_id="${patientID}"`;
  //execute
  try {
    patientData = await mysql.query(sql_patient_data);
    patientTreatment = await mysql.query(sql_patient_treatment);
    online_status = await  mysql.query(sql_online_status);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  if (patientData.length<=0){
    res.send({ error: "No records found." });
    return; 
  }
  const data={
    patient_data: patientData[0],
    treatments: patientTreatment, 
    status: online_status.length > 0 ? online_status[0].session_status : "inactive"
  }
  //console.log(online_status[0].session_status, online_status)

  res.json(data);
})
//-----------------------
//Endpoint  to handle the save visit request
app.post('/saveVisit', (req, res) => {
  const visitDetails = req.body;
  console.log('Received visit details:', visitDetails);
  const sql_visit_data = `insert into doctor_patient_visits
  (doctor_id, patient_id, reason_for_visit, observations, date, start_time, end_time)
  values("${visitDetails.doctorId}", "${visitDetails.patientId}", 
  "${visitDetails.reasonForVisit}", "${visitDetails.notes}", "${visitDetails.visitDate}",
   "${visitDetails.startTime}", "${visitDetails.endTime}")`;

  const sql_registry= `insert into doctor_servicehistory(patient_id, doctor_id, service_date)
  values("${visitDetails.patientId}", "${visitDetails.doctorId}", "${visitDetails.visitDate}")`;

  //execute
  try {
    mysql.query(sql_visit_data);
    mysql.query(sql_registry);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  
  res.status(200).send({ message: 'Visit saved successfully' });
});
// Insert Treatment
app.post('/saveTreatment', (req, res) => {
  const treat = req.body;
  console.log(treat)
  const sql_treatment =`insert into patients_treatment(patient_id, doctor_id, treatment, RecordDate, disease_type , disease_id) 
  values 
  (   ${treat.patientId}, ${treat.doctorId},
     "${treat.treatment}","${treat.date}",
      ${treat.diseaseType ? "'"+ treat.diseaseType +"'": 'Null'},
      ${treat.diseaseId ? treat.diseaseId : 'Null'} )`;
     //execute
  try {
    mysql.query(sql_treatment);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.status(200).send({ message: 'Treatment saved successfully' });
})
//Get Past Visits
app.post("/patientVisits", async (req, res) => {
  const doctorID= req.body.doctorId;
  const patientID = req.body.patientId;
  let patientVisits= [];
  //queries
  const sql_patient_visit= `select * from doctor_patient_visits 
                            where patient_id=${patientID} and doctor_id=${doctorID}`; 
  //execute
  try {
    patientVisits = await  mysql.query(sql_patient_visit);
    res.status(200).send(patientVisits);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
   
});
//Retrieve Doctor Reminder
app.post("/getDoctorReminders", async (req, res) => {
  const { doctorId } = req.body;

  // Validate and sanitize doctorId here

  // Non-Parameterized Select SQL query
  const sql_reminders = `SELECT * FROM doctor_reminders WHERE doctor_id = ${doctorId}`;

  try {
      let data = await mysql.query(sql_reminders);
      if (data.length === 0) {
          res.status(404).send({ message: "No reminders found." });
      } else {
          res.status(200).send(data);
      }
  } catch (error) {
      console.error("Error Retrieving reminder:", error);
      res.status(500).send({ error: "Error Retrieving reminder in MySQL." });
  }
});


// Save Doctor Reminder
app.post("/saveDoctorReminder", async (req, res) => {
  const { doctorId, reminderDescription } = req.body;
  // Insert SQL query
  const sql_insert_reminder = `insert into doctor_reminders(doctor_id, reminder_description) values (${doctorId}, '${reminderDescription}')`;
  try {
      await mysql.query(sql_insert_reminder);
      res.status(200).send({ message: "Reminder saved successfully" });
  } catch (error) {
      console.error("Error saving reminder:", error);
      res.status(500).send({ error: "Error saving reminder in MySQL." });
  }
});
//Retrieve Doctor To Patient Messages 
app.post("/getDoctorPatientMessages", async (req, res) => {
  const { doctorId, patientId } = req.body;
  // Select SQL query
  const sql_reminders = `select * from doctor_to_patient_message
                        where doctor_id=${doctorId} and patient_id=${patientId} 
                        order by time_stamp desc `;
  try {
      let data = await mysql.query(sql_reminders);
      res.status(200).send(data);
  } catch (error) {
      console.error("Error Retrieving messages:", error);
      res.status(500).send({ error: "Error Selecting reminder in MySQL." });
  }
});

//Send Doctor to Patient Message
app.post("/sendDoctorPatientMessage", async (req, res) => {
  const { doctorId, patientId, doctorFName, doctorLName,
     patientFName, patientLName, message, time} = req.body;

  // Add validation and sanitization for the input data here

  // Non-Parameterized Insert SQL query
  const sql_insert_message = `
    INSERT INTO doctor_to_patient_message (
      doctor_id, patient_id, doctor_FName, doctor_LName, patient_FName, 
      patient_LName, message, time_sent
    ) VALUES (
      '${doctorId}', '${patientId}', '${doctorFName.replace(/'/g, "''")}', 
      '${doctorLName.replace(/'/g, "''")}', '${patientFName.replace(/'/g, "''")}', 
      '${patientLName.replace(/'/g, "''")}', '${message.replace(/'/g, "''")}', '${time}'
    )`;

  try {
      await mysql.query(sql_insert_message);
      res.status(200).send({ message: "Message saved successfully" });
  } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).send({ error: "Error saving message in MySQL." });
  }
});


//Surgery Planning
app.post("/saveSurgeryPlan", async (req, res) => {
  const { doctorId, patientId, surgeryType, surgeryDate, 
          preSurgeryConsultationDetails, riskAssessmentDetails, 
          postOperativeCarePlan } = req.body;

  // Add validation and sanitization for the input data here

  // Non-Parameterized Insert SQL query
  const sql_insert_plan = `
    INSERT INTO surgery_planning (
      doctor_id, 
      patient_id, 
      surgery_type, 
      surgery_date, 
      pre_surgery_consultation_details, 
      risk_assessment_details, 
      post_operative_care_plan
    ) VALUES (
      '${doctorId}', 
      '${patientId}', 
      '${surgeryType.replace(/'/g, "''")}', 
      '${surgeryDate.replace(/'/g, "''")}', 
      '${preSurgeryConsultationDetails.replace(/'/g, "''")}', 
      '${riskAssessmentDetails.replace(/'/g, "''")}', 
      '${postOperativeCarePlan.replace(/'/g, "''")}'
    )`;

  try {
      await mysql.query(sql_insert_plan);
      res.status(200).send({ message: "Surgery plan saved successfully" });
  } catch (error) {
      console.error("Error saving surgery plan:", error);
      res.status(500).send({ error: "Error saving surgery plan in MySQL." });
  }
});



// Surgery Plan Retrieval
app.post("/getSurgeryPlan", async (req, res) => {
  const { doctorId } = req.body;
  console.log("Received doctorId:", doctorId);

  if (!doctorId) {
    res.status(400).send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }

  // Add validation and sanitization for doctorId here

  // Non-Parameterized SQL Query to retrieve the surgery plan
  const sql_retrieve_plan = `SELECT * FROM surgery_planning WHERE doctor_id = ${doctorId}`;

  try {
      const surgeryPlans = await mysql.query(sql_retrieve_plan);
      console.log("Query result:", surgeryPlans);
      if (surgeryPlans.length === 0) {
          res.status(404).send({ error: "No surgery plans found." });
      } else {
          res.status(200).send(surgeryPlans);
      }
  } catch (error) {
      console.error("Error retrieving surgery plan:", error);
      res.status(500).send({ error: "Error retrieving surgery plan from MySQL." });
  }
});
//Patient Medical History
app.post("/patientMedicalHistory", async (req, res) => {
  const patientID = req.body.patientId;
  console.log("In medical History")
  if (!patientID) {
    res.status(400).send({ error: "Missing Patient ID." });
    console.log("Missing Patient ID.");
    return;
  }

  // Add validation and sanitization for patientID here

  const tablesWithRecordDate = ['physical_test_cad', 'physical_test_ck', 'physical_test_hd', 'physical_test_ms', 'bloodtests', 'ecg', 'eye_test', 'tumor'];
  const tablesWithoutRecordDate = ['vaccines'];

  const sqlTemplate = (tableName, hasRecordDate) => `
    SELECT * 
    FROM ${tableName} 
    WHERE patient_id = ${patientID}
    ${hasRecordDate ? 'ORDER BY RecordDate DESC' : ''}
  `;

  try {
    let data = {};
    let total_records = {};

    for (const table of tablesWithRecordDate) {
      const sql = sqlTemplate(table, true);
      const result = await mysql.query(sql);
      data[table] = result;
      total_records[`${table}_total`] = result.length;
    }

    for (const table of tablesWithoutRecordDate) {
      const sql = sqlTemplate(table, false);
      const result = await mysql.query(sql);
      data[table] = result;
      total_records[`${table}_total`] = result.length;
    }

    console.log({ total_records, ...data });
    res.json({ total_records, ...data });
  } catch (error) {
    console.error("Error in MySQL:", error);
    res.status(500).send({ error: "Something wrong in MySQL." });
  }
});

//Doctor Send Task Request to Staff
app.post("/sendDoctorStaffMessage", async (req, res) => {
  const { doctorId, patientId, task } = req.body;

  // Validate and sanitize inputs
  // IMPORTANT: Add validation and sanitization here

  // Non-Parameterized SQL query
  const sql_insert_message = `INSERT INTO doctor_task_request 
                              (doctor_id, patient_id, task,check_status)
                              VALUES (${doctorId}, ${patientId}, '${task}', 0)`;

  try {
      await mysql.query(sql_insert_message);
      res.status(200).send({ message: "Message saved successfully" });
  } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).send({ error: "Error saving message in MySQL." });
  }
});


//Get All prescriptions
app.post("/getPrescriptions", async(req, res) => {
  const { doctorId, patientId } = req.body;

  // Validate and sanitize inputs
  // IMPORTANT: Add validation and sanitization here to prevent SQL injection
  console.log(doctorId, patientId)
  // Non-Parameterized SQL query
  const sql_select = `SELECT * FROM prescription WHERE doctor_id = ${doctorId} AND patient_id = ${patientId}`;
  console.log("In Prescription")
  try {
    const result = await mysql.query(sql_select);
    console.log(result)
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in MySQL:", error);
    res.status(500).send({ error: "Something wrong in MySQL." });
  }
});

//Save Prescription
app.post("/savePrescription", async (req, res) => {
  const { doctorId, patientId, doctorFName, doctorLName, doctorPhone, doctorOfficeAddress,
          patientFName, patientLName, patientPhone, patientAddress, prescription } = req.body;

  // Add input validation and sanitization here 

  // Non-Parameterized Insert SQL query
  const sql_insert = `
    INSERT INTO prescription (
      doctor_id, 
      patient_id, 
      doctor_FName, 
      doctor_LName, 
      doctor_phone,
      doctor_office_address, 
      patient_FName, 
      patient_LName,
      patient_phone, 
      patient_address,
      prescription_description
    ) VALUES (
      '${doctorId}', 
      '${patientId}', 
      '${doctorFName.replace(/'/g, "''")}',
      '${doctorLName.replace(/'/g, "''")}',
      '${doctorPhone.replace(/'/g, "''")}', 
      '${doctorOfficeAddress.replace(/'/g, "''")}',
      '${patientFName}', 
      '${patientLName}', 
      '${patientPhone.replace(/'/g, "''")}', 
      '${patientAddress.replace(/'/g, "''")}',
      '${prescription.replace(/'/g, "''")}'
    )`;

  try {
      await mysql.query(sql_insert);
      res.status(200).send({ message: "Prescription saved successfully" });
  } catch (error) {
      console.error("Error saving prescription:", error);
      res.status(500).send({ error: "Error saving prescription in MySQL." });
  }
});

//Delete Reminder

app.post("/deleteReminder", async (req, res) => {
  const reminderId = parseInt(req.body.reminderId, 10);
  const doctorId = parseInt(req.body.doctorId, 10);
  console.log(reminderId, doctorId)
  const sql_delete_reminder = `DELETE FROM doctor_reminders WHERE id=${reminderId} AND doctor_id=${doctorId}`;

  try {
      const result = await mysql.query(sql_delete_reminder);
      if (result.affectedRows === 0) {
          res.status(404).send({ message: "No reminder found to delete." });
      } else {
          res.status(200).send({ message: "Reminder deleted successfully." });
      }
  } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).send({ error: "Error deleting reminder in MySQL." });
  }
});

// Save Referrals
app.post('/saveReferral', (req, res) => {
  const referral = req.body;
  console.log(referral);

  const sqlInsertReferral = `
    INSERT INTO doctor_referrals (
      doctor_id, 
      patient_id, 
      referred_doctor_FName, 
      referred_doctor_LName, 
      referred_doctor_phone, 
      referred_doctor_specialization, 
      is_referred_doctor_in_system, 
      referred_doctor_id, 
      referral_date, 
      referral_message
    ) VALUES (
      ${referral.doctorId}, 
      ${referral.patientId},
      "${referral.referredDoctorFName}",
      "${referral.referredDoctorLName}",
      "${referral.referredDoctorPhone}",
      "${referral.referredDoctorSpecialization}",
      ${referral.isReferredDoctorInSystem ? 1 : 0},
      ${referral.referredDoctorId ? referral.referredDoctorId : 'NULL'},
      "${referral.referralDate}",
      "${referral.referralMessage}"
    )
  `;

  // Execute the query
  try {
    mysql.query(sqlInsertReferral, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Error in MySQL query." });
      } else {
        res.status(200).send({ message: 'Referral saved successfully', results });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong with the MySQL server." });
  }
});

//-------
app.post('/getReferral', async (req, res) => {
  const { doctorId } = req.body;

  // Validate and sanitize inputs
  // IMPORTANT: Add validation and sanitization here to prevent SQL injection
  
  const selectJoin=`SELECT 
        dr.referral_id,
        dr.doctor_id,
        referringDoc.Fname AS referring_doctor_FName,
        referringDoc.Lname AS referring_doctor_LName,
        dr.patient_id,
        pr.FName AS patient_FName,
        pr.LName AS patient_LName,
        pr.MobileNumber AS patient_MobileNumber,
        dr.referred_doctor_FName,
        dr.referred_doctor_LName,
        dr.referred_doctor_phone,
        dr.referred_doctor_specialization,
        dr.is_referred_doctor_in_system,
        dr.referred_doctor_id,
        dr.referral_date,
        dr.referral_message,
        dr.first_appointment_date,
        dr.record_time
      FROM doctor_referrals dr
      LEFT JOIN patients_registration pr ON dr.patient_id = pr.id
      LEFT JOIN doctors_registration referringDoc ON dr.doctor_id = referringDoc.id
      WHERE dr.doctor_id = ${doctorId}`; 
  
  try {
    const result = await mysql.query(selectJoin);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in MySQL:", error);
    res.status(500).send({ error: "Something wrong in MySQL." });
  }
});
app.post('/getIncomingReferrals', async (req, res) => {
  const { doctorId } = req.body;

  // Validate and sanitize inputs
  // IMPORTANT: Add validation and sanitization here to prevent SQL injection
  const selectJoin=`SELECT 
        dr.referral_id,
        dr.doctor_id,
        referringDoc.Fname AS referring_doctor_FName,
        referringDoc.Lname AS referring_doctor_LName,
        dr.patient_id,
        pr.FName AS patient_FName,
        pr.LName AS patient_LName,
        pr.MobileNumber AS patient_MobileNumber,
        dr.referred_doctor_FName,
        dr.referred_doctor_LName,
        dr.referred_doctor_phone,
        dr.referred_doctor_specialization,
        dr.is_referred_doctor_in_system,
        dr.referred_doctor_id,
        dr.referral_date,
        dr.referral_message,
        dr.first_appointment_date,
        dr.record_time
      FROM doctor_referrals dr
      LEFT JOIN patients_registration pr ON dr.patient_id = pr.id
      LEFT JOIN doctors_registration referringDoc ON dr.doctor_id = referringDoc.id
      WHERE dr.referred_doctor_id = ${doctorId}; 
`;
  
  try {
    const result = await mysql.query(selectJoin);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in MySQL:", error);
    res.status(500).send({ error: "Something wrong in MySQL." });
  }
});

app.post("/addReview", jsonParser, bodyParser.urlencoded({ extended: false }),async (req, res) => {
  const patientID = req.body.userId;
  if (!patientID ) {
 
    console.log("UserId Missing ID.");
    return  res.send({ error: "UserId Missing ID." }).status(500);;
  }
    //queries
  sql_review_insert_query= `INSERT INTO userreviews(UserID,Review, Rating) VALUES ('${req.body.userId}','${req.body.review}',${req.body.rating}) `;       
  
  //execute
  try {
     await mysql.query(sql_review_insert_query);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." }).status(500);
    return;
  }
  
  //console.log(patientData) 
  
  res.json({
    response:"Review Sucessfully Submitted"
  }).status(200);
})

app.get("/GetAllReviews",async (req, res) => {
  
    //queries
  sql_review_insert_query= `SELECT * FROM userreviews; `;       
  
  //execute
  try {
    data =  await mysql.query(sql_review_insert_query);
    return  res.send(data).status(200)
    
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." }).status(500);
    return;
  }
  
  //console.log(patientData) 
  
  res.json({
    response:"Review Sucessfully Submitted"
  }).status(200);
})

  
//-------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.

///voicerecognition code
const typeToCollectionMap = {
  bloodtest: 'Bloodtest_Report',
  mrireport: 'MRI_Brain', 
  ctscan: 'CT-Scan_Abdomen',
  cellimages: 'Cell-Images',
  ecgreport: 'ECG_Report',
  echocardiogram: 'Echocardiogram',
  skindiseases: 'Skin_Diseases',
  skinimages: 'Skin_Images',
  ultrasoundabdomen: 'Ultrasound_Abdomen',
  medicalhistory: 'Medical_History',
  xrayreport: 'X-Ray_Lung',
  endoscope: 'Endoscopic',
  template: 'template'
};

app.get("/files/:filetype/:patientId", async (req, res) => {
  const filetype = req.params.filetype;
  const patientId = req.params.patientId;

  console.log("File type:", filetype);
  console.log("PatientId:", patientId);

  try {
    const db = client.db("htdata");
    const collectionName = typeToCollectionMap[filetype];

    if (!collectionName) {
      return res.status(400).send("Invalid file type");
    }
 
    const collection = db.collection(collectionName);
    const result = await collection.findOne({ patient_id: parseInt(patientId) });

    if (!result) {
      return res.status(404).send("File not found");
    }

    console.log("Result:", result);

    if (!result.file || !result.file.buffer) {
      console.error("Invalid file structure - 'buffer' field is missing:", result);
      return res.status(500).send("Invalid file structure - 'buffer' field is missing");
    }

    const { buffer } = result.file;
    if (!buffer) {
      console.error("Invalid file structure - 'buffer' field is missing:", result);
      return res.status(500).send("Invalid file structure - 'buffer' field is missing");
    }

  
    return res.send({ data: buffer.toString('base64') });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Psychology Data Endpoint
 **/
app.get('/psychology/:patientId', async (req, res, nxt) => {
  const { patientId } = req.params;

  psychologysql = `SELECT * FROM psychology_information
          WHERE patient_id = "${patientId}" 
          limit 1`;

  patientsql = `SELECT case Gender
      when 'Male' then 1
      when 'Female' then 0
      else 2
      end as Gender,
      Age FROM patients_registration
        WHERE id = ${patientId}
        limit 1`;

  let psychologyData = null;
  let patientData = null;
  try {
      psychologyData = await mysql.query(psychologysql);
      patientData = await mysql.query(patientsql);
  } catch (error) {
      return res.status(500).send({ error: "Something wrong in MySQL" });
  }

  if (!psychologyData || !patientData) {
      return res.status(404).send({ error: "No patient matched in database." });
  }
  
  return res.json({...psychologyData[0], ...patientData[0]});
});

/**
 * Psychology Data Endpoint ends
 **/







/* Analytics page end point */
app.get("/patientsRegistration", async (req, res) => {
  const sqlPatientsRegistration = `SELECT * FROM patients_registration`;

  try {
    const patientsRegistration = await mysql.query(sqlPatientsRegistration);
    res.status(200).send(patientsRegistration);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

/* Analytics page end point */
app.get("/doctorsRegistration", async (req, res) => {
  const sqlDoctorsRegistration = `SELECT * FROM doctors_registration`;

  try {
    const doctorsRegistration = await mysql.query(sqlDoctorsRegistration);
    res.status(200).send(doctorsRegistration);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.get("/alzheimers", async (req, res) => {
  const sqlalzheimer = `SELECT * FROM alzheimer`;

  try {
    const alzheimer = await mysql.query(sqlalzheimer);
    res.status(200).send(alzheimer);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send({ error: "Internal server error" });
  } 
});

app.get("/combinedPredictions", async (req, res) => {
  const sqlQuery = `
  SELECT patient_id, prediction, 'alzheimer' AS table_name FROM nkw2tiuvgv6ufu1z.alzheimer
  UNION ALL
  SELECT patient_id, prediction, 'arrhythmia' AS table_name FROM nkw2tiuvgv6ufu1z.arrhythmia
  UNION ALL
  SELECT patient_id, prediction, 'brain_tumor' AS table_name FROM nkw2tiuvgv6ufu1z.brain_tumor
  UNION ALL
  SELECT patient_id, prediction, 'breast_cancer' AS table_name FROM nkw2tiuvgv6ufu1z.breast_cancer
  UNION ALL
  SELECT patient_id, prediction, 'breast_disease' AS table_name FROM nkw2tiuvgv6ufu1z.breast_disease
  UNION ALL
  SELECT patient_id, prediction, 'cancers' AS table_name FROM nkw2tiuvgv6ufu1z.cancers
  UNION ALL
  SELECT patient_id, prediction, 'cardiovascular' AS table_name FROM nkw2tiuvgv6ufu1z.cardiovascular
  UNION ALL
  SELECT patient_id, prediction, 'chronic_kidney' AS table_name FROM nkw2tiuvgv6ufu1z.chronic_kidney
  UNION ALL
  SELECT patient_id, prediction, 'coronary_artery_disease' AS table_name FROM nkw2tiuvgv6ufu1z.coronary_artery_disease
  UNION ALL
  SELECT patient_id, prediction, 'gastrointestinal_disease' AS table_name FROM nkw2tiuvgv6ufu1z.gastrointestinal_disease
  UNION ALL
  SELECT patient_id, prediction, 'heart_disease' AS table_name FROM nkw2tiuvgv6ufu1z.heart_disease
  UNION ALL
  SELECT patient_id, prediction, 'juvenile_myopia' AS table_name FROM nkw2tiuvgv6ufu1z.juvenile_myopia
  UNION ALL
  SELECT patient_id, prediction, 'kidney_stone' AS table_name FROM nkw2tiuvgv6ufu1z.kidney_stone
  UNION ALL
  SELECT patient_id, prediction, 'liver_diseases' AS table_name FROM nkw2tiuvgv6ufu1z.liver_diseases
  UNION ALL
  SELECT patient_id, prediction, 'malaria' AS table_name FROM nkw2tiuvgv6ufu1z.malaria
  UNION ALL
  SELECT patient_id, prediction, 'multiple_sclerosis' AS table_name FROM nkw2tiuvgv6ufu1z.multiple_sclerosis
  UNION ALL
  SELECT patient_id, prediction, 'pneumonia' AS table_name FROM nkw2tiuvgv6ufu1z.pneumonia;
  
  `;

  try {
      const combinedData = await mysql.query(sqlQuery);
      console.log("combined data", combinedData)
      res.status(200).send(combinedData);
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).send({ error: "Internal server error" });
  } 
});
