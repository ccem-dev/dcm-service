const request = require('request');

var { //todo change for const
    DCM_HOST,
    KEYCLOAK_PORT,
    CURL_SECRET
} = process.env;

// Host IP
DCM_HOST = '143.54.220.73';

// Keycloak port:
KEYCLOAK_PORT = '8843';

//Curl secret
// CURL_SECRET = '5a7def58-df35-412a-94fa-1d1fdf0f6000A';
CURL_SECRET = '5a7def58-df35-412a-94fa-1d1fdf0f6000';


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
            if (error) {
                reject(error);
            }
            if (response.statusCode === 200) {
                let token = JSON.parse(body).access_token;
                resolve(token);
            } else {
                reject('Authorization error');
            }
        });
    });
}

module.exports = self;