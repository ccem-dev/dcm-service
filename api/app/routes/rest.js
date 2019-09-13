var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var service = require('../services/AppService.js');
var btoa = require('btoa');

module.exports = function (application) {
    const controller = application.app.controllers.AppController;

    application.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // res.header('Content-Type', 'image/jpeg');
        
        // res.header('Encoding', 'Base64');
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

    application.get('/participant-exams', async function (req, res) {
        //TODO: call controller
        // res.status(200).send('result')

        service.doit()
            .then(result => {
                res.status(200).send(Buffer.from(result, 'hex'))
            });
    });

    application.post('/api/retinography', jsonParser, async function (req, res) {
        //TODO: call controller
        service.doit().then(result => {
            // res.status(200).send({
            //     date: "2019-09-09T17:40:34.699Z",
            //     eye: 'left',
            //     result: btoa(unescape(encodeURIComponent(result)))
            // })
            res.status(200).send(btoa(unescape(encodeURIComponent(result))))
        });
    });

    application.post('/', jsonParser, function (req, res) {
        //TODO: call controller
        res.status(200).send({})
    });
};
