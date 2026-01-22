const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

module.exports = app;
const userRoutes = require("./users/users.routes");

app.use("/users", userRoutes);

exports.api = functions.https.onRequest(app);
