var app = require("./config/server");
const listEndpoints = require('express-list-endpoints');

const {
  API_PORT
} = process.env;

const port = API_PORT || 8081;


connect();

function listen() {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  listen();
  endpointsList();
}

function endpointsList() {
  let endpoints = listEndpoints(app);
  console.table(endpoints)
}
