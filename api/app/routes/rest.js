var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

module.exports = function (application) {
  const controller = application.app.controllers.AppController;

  application.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    next();
  });

  application.put('/', jsonParser, async function (req, res) {
    //TODO: call controller
   res.status(200).send({})
  });

  application.delete('/', async function (req, res) {
    //TODO: call controller
   res.status(200).send({})
  });

  application.get('/', async function (req, res) {
    //TODO: call controller
   res.status(200).send({})
  });


  application.post('/', jsonParser, function (req, res) {
   //TODO: call controller
   res.status(200).send({})
  });
};
