const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan"); // logger
const helmet = require("helmet"); // headers
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Routes Imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messengerRoutes = require("./routes/messenger");

// App initialization
const app = express();

// Debuggers
mongoose.set("debug", true);

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

// Logger
app.use(
  process.env.PORT
    ? morgan("combined", { stream: accessLogStream })
    : morgan("dev")
);

// app.use(cors({
//   origin: CLIENT_ORIGIN
// }))
// CORS
app.options("*", cors()); // enable pre-flight across-the-board
app.use(cors());
app.use(helmet());

// BodyParser
app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www-form-urlencoded

// Serving Images Statically
app.use("/data", express.static(path.join(__dirname, "data")));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/messenger", messengerRoutes);

// Error Handler
app.use((error, req, res, next) => {
  console.log(error);
  const message = error.message;
  const status = error.status || 500;
  res.status(status).json({ message: message, error: error });
});

// PORT Handling
const PORT = process.env.PORT || 8080;

// Connecting to Database and listening to server
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    const server = app.listen(PORT, () =>
      console.log(`App listening at ${PORT}`)
    );
    const IOImport = require("./socket/socket");
    const io = IOImport.init(server);
    io.on("connection", (socket) => {
      console.log(
        "Connection Established, Total = ",
        IOImport.addUser(socket).length
      );
      IOImport.getUsers().map((user) => console.log(user.userId, user.id));

      socket.on("disconnect", () => {
        console.log(
          "Connection Demolished, Total = ",
          IOImport.deleteUser(socket).length
        );
      });
    });
  })
  .catch((err) => {
    console.log("[App.Mongoose]", err);
  });
