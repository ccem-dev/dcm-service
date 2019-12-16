const request = require('request');

const {
    DICOM_AUTHENTICATION_HOST,
    DICOM_AUTHENTICATION_PORT,
    DICOM_SECRET
} = process.env;

/*===============*/
module.exports = {
    authenticate: authenticate
};

/*==============*/

function authenticate() {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            url: 'https://' + DICOM_AUTHENTICATION_HOST + ':' + DICOM_AUTHENTICATION_PORT + '/auth/realms/dcm4che/protocol/openid-connect/token',
            form: {
                grant_type: 'client_credentials',
                client_id: 'curl',
                client_secret: DICOM_SECRET
            },
            headers: {'cache-control': 'no-cache'}
        };
        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            }
            if (response && response.statusCode === 200) {
                let token = JSON.parse(body).access_token;
                resolve(token);
            } else {
                reject('Authorization error');
            }
        });
    });
}
