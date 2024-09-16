const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.json()); // body parser
// We store the file content into a variable named students and whenever there is any updates,
// in it we will call saveChages function

let students = {};
let lastStudentKeyNumber = 0;

const readData = () => {
  // since the json file content will be json string we need to parse it, to convert it into javascript object
  students = JSON.parse(fs.readFileSync("./Students.json", "utf-8"));
};

readData();

const findLastStudentKey = () => {
  for (key of Object.keys(students)) {
    const number = key.split("-")[1];
    lastStudentKeyNumber = Math.max(lastStudentKeyNumber, number);
  }
};
findLastStudentKey();

// console.log(lastStudentKeyNumber);

const saveChanges = () => {
  // important note: We need to first stringify the javascript object before writing to a json file
  fs.writeFileSync("./Students.json", JSON.stringify(students));
};

app.get("/listStudents", (req, res) => {
  return res.status(200).send(JSON.stringify(students));
});

app.get("/studentDetails/:id", (req, res) => {
  const { id } = req.params;
  const key = `student-${id}`;
  if (key in students) {
    return res.status(200).send(JSON.stringify(students[key]));
  }
  return res.status(400).send("Invalid student id");
});

app.post("/addStudent", (req, res) => {
  // ik validation is must but, considering the time constraint.
  const lastKey = `student-${lastStudentKeyNumber}`;
  const newStudentId = students[lastKey].id + 1;
  const newStudent = {
    id: newStudentId,
    ...req.body,
  };
  lastStudentKeyNumber++;
  const newKey = `student-${lastStudentKeyNumber}`;
  students[newKey] = newStudent;
  saveChanges();
  return res.send("Student added");
});

app.patch("/updateEmail/:id", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) {
    return res.status(400).send("Email required");
  }
  const key = `student-${id}`;
  if (key in students) {
    students[key].email = email;
    saveChanges();
    return res.status(200).send(JSON.stringify(students[key]));
  }
  return res.status(400).send("Invalid student ID");
});

app.delete("/removeStudent/:id", (req, res) => {
  const { id } = req.params;
  const key = `student-${id}`;
  if (key in students) {
    delete students[key];
    saveChanges();
    return res.status(200).send("Student removed");
  }
  return res.status(400).send("Invalid student id");
});

app.listen(3000, () => console.log("server is up and running at port 3000"));
