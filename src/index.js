const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

// // Multer middleware
// const multer = require("multer");
// const upload = multer({
//   dest: "images", // images directory
// });

// //Multer looks for the 'upload'
// app.post("/upload", upload.single("upload"), (req, res) => {
//   res.send();
// });

// To grab incomming json body data
app.use(express.json());

// To register user/task handlers with this app
app.use(userRouter);
app.use(taskRouter);

// Listening
app.listen(port, () => {
  console.log("Server is up on port: ", port);
});
