const request = require('request');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Host IP
var DCM_HOST = '143.54.220.73';
// var DCM_HOST = process.env['DCM_HOST'];

// Keycloak port:
var KEYCLOAK_PORT = '8843';
// var KEYCLOAK_PORT = process.env['KEYCLOAK_PORT'];

var CURL_SECRET = '5a7def58-df35-412a-94fa-1d1fdf0f6000';
// var CURL_SECRET = process.env['CURL_SECRET'];


var self = this;
self.authenticate = authenticate;

function authenticate() {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            url: 'https://' + DCM_HOST + ':' + KEYCLOAK_PORT + '/auth/realms/dcm4che/protocol/openid-connect/token',
            form: {
                grant_type: 'client_credentials',
                client_id: 'curl',
                client_secret: CURL_SECRET
            },
            headers: {'cache-control': 'no-cache'}
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            let token = JSON.parse(body).access_token;
            resolve(token);
        });
    });
}

module.exports = self;