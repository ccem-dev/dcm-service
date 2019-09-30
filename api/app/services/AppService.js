//TODO: call model
// application.app
const request = require('request');
const https = require('https');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//todo: check what todo with those tsl errors

module.exports = {
    doit: doit
};

function doit(data) {
    return requestToken()
        .then(token => {
            return requestImage(token, data)
        });
}

function requestToken() {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            url: 'https://143.54.220.35:8843/auth/realms/dcm4che/protocol/openid-connect/token',
            headers:
            {
                'cache-control': 'no-cache'
            },
            form:
            {
                grant_type: 'client_credentials',
                client_id: 'curl',
                client_secret: '72126ea5-28e3-4307-9dde-6f63cc6f9aa5',
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            resolve(JSON.parse(body).access_token);
        });
    });
}

function requestImage(token) {
    return new Promise((resolve, reject) => {

        const options = {
            method: 'GET',
            hostname: '143.54.220.35',
            port: '8443',
            path: "/dcm4chee-arc/aets/DCM4CHEE/wado?requestType=WADO&studyUID=1.2.392.200046.100.3.3.200518.3824.20170307091443&seriesUID=1.2.392.200046.100.3.3.200518.3824.20170307091443.1&objectUID=1.2.392.200046.100.3.3.200518.3824.20170307091443.1.1.1&contentType=image%2Fjpeg&frameNumber=1",
            headers: {
                'Authorization': 'Bearer ' + token,
                "cache-control": "no-cache",
                "Content-Type": "image/jpeg"
            }
        }

        var req = https.request(options, incomingMessage => {
            var chunks = [];
            incomingMessage.on("data", function (chunk) {
                chunks.push(chunk);
            });

            incomingMessage.on("end", function () {
                var body = Buffer.concat(chunks);
                resolve(body);
            });
        });

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
}
