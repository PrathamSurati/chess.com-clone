const express = require("express");
const http = require("http");
const {chess} = require("chess.js");
const socket = require("socket.io");

const app = express();

const serrver = http.createServer(app);

const io = socket(server);


app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
