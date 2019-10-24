var app = require("./config/server");
const listEndpoints = require('express-list-endpoints');

const {
  API_PORT
} = process.env;


connect();

function listen() {
  app.listen(API_PORT);
  console.log('Express app started on port ' + API_PORT);
}

function connect() {
  listen();
  endpointsList();
}

function endpointsList() {
  let endpoints = listEndpoints(app);
  console.table(endpoints)
}
