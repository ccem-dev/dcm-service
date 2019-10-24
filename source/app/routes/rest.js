var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var Facade = require('../controllers/Facade.js');

module.exports = function (application) {
    application.all('*', function (req, response, next) {
        response.header('Access-Control-Allow-Credentials', true);
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Content-Type', 'application/json');
        next();
    });

    // Example
    // {"recruitmentNumber":"0002","sending":0}
    application.post('/api/retinography', jsonParser, async function (req, res) {
        Facade.getRetinography(req.body)
            .then(data => {
                res.status(200).send({
                    "data": data
                });
            })
            .catch(e => {
                res.status(e.code).send(e);
            });

    });
};