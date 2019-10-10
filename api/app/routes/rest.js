var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var facade = require('../services/facade.js');

module.exports = function (application) {
    const controller = application.app.controllers.AppController;

    application.all('*', function (req, response, next) {
        response.header('Access-Control-Allow-Credentials', true);
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Content-Type', 'application/json');
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

    application.post('/api/retinography', jsonParser, async function (req, res) {
        try {
            facade.getRetinography(req.body)
                .then(data => {
                    res.status(200).send({
                        "data": data
                    });
                });
        } catch (e) {
            res.status(400).send(e);
        }
    });

    application.post('/', jsonParser, function (req, res) {
        //TODO: call controller
        res.status(200).send({})
    });
};
