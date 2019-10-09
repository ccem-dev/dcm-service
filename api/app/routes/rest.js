var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var service = require('../services/AppService.js');

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

    application.get('/participant-exams', async function (req, res) {
        //TODO: call controller
        // res.status(200).send('result')
        service.doit()
            .then(result => {
                res.status(200).send(Buffer.from(result, 'hex'))
            });
    });

    application.post('/api/retinography', jsonParser, async function (req, res) {
        if (req.body.recruitmentNumber) {
            if(req.body.examName==='Retinography'){req.body.examName='XC'}
            service.doit(req.body.recruitmentNumber,req.body.examName)
                .then(data => {
                    res.status(200).send({
                        "data": data
                    })
                    console.log(req.body);
                });
        } else {
            res.status(400).send();
        }
        // console.log(jsonParser());
    });

    application.post('/', jsonParser, function (req, res) {
        //TODO: call controller
        res.status(200).send({})
    });
    //
    // var parse = function (img) {
    //     var b = new Buffer(img, 'base64');
    //     return b.toString();
    // }
    //
    // var hexToBase64 = function (str) {
    //     return Buffer.from((String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))));
    // }
    //
    // var btoa = function (str) {
    //     return Buffer.from(str).toString('base64')
    // }
    //
    // var base64Encode = function (str) {
    //     var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    //     var out = "", i = 0, len = str.length, c1, c2, c3;
    //     while (i < len) {
    //         c1 = str.charCodeAt(i++) & 0xff;
    //         if (i == len) {
    //             out += CHARS.charAt(c1 >> 2);
    //             out += CHARS.charAt((c1 & 0x3) << 4);
    //             out += "==";
    //             break;
    //         }
    //         c2 = str.charCodeAt(i++);
    //         if (i == len) {
    //             out += CHARS.charAt(c1 >> 2);
    //             out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    //             out += CHARS.charAt((c2 & 0xF) << 2);
    //             out += "=";
    //             break;
    //         }
    //         c3 = str.charCodeAt(i++);
    //         out += CHARS.charAt(c1 >> 2);
    //         out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    //         out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    //         out += CHARS.charAt(c3 & 0x3F);
    //     }
    //     return out;
    // }

};
