var app = require("./config/server");
const listEndpoints = require('express-list-endpoints');

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
  API_PORT
} = process.env;

const port = API_PORT || 8081;

connect();

function listen() {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  // mongoose.connection
  //   .on('error', console.log)
  //   .on('disconnected', connect)
  //   .once('open', listen);
  listen();
  endpointsList();
  // return mongoose.connect(url, options);
}

function endpointsList() {
  let endpoints = listEndpoints(app);
  console.table(endpoints)
}
