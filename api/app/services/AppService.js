//TODO: call model
// application.app
const request = require('request');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//todo: check what todo with those tsl errors


requestToken()
    .then(result => {
        // requestTester(result);
        // requestStudies(result)
        requestImage(result)
        console.log(result)
    });


function requestToken() {
    return new Promise((resolve, reject) => {

        var options = {
            method: 'POST',
            url: 'https://143.54.220.73:8843/auth/realms/dcm4che/protocol/openid-connect/token',
            headers:
                {
                    'cache-control': 'no-cache'
                },
            form:
                {
                    grant_type: 'client_credentials',
                    client_id: 'curl',
                    client_secret: '5a7def58-df35-412a-94fa-1d1fdf0f6000',
                }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            resolve(JSON.parse(body).access_token);
        });
    });

}

function requestStudies(token) {
    var options = {
        method: 'GET',
        url: 'https://143.54.220.73:8443/dcm4chee-arc/aets/DCM4CHEE/rs/studies',
        qs: {'00100020': 'teste'},
        headers:
            {
                'Postman-Token': 'eee3ff1e-3e31-4ad8-a488-431281bf8a3f',
                'cache-control': 'no-cache',
                Authorization: 'Bearer ' + token
            }
    };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        JSON.parse(body).forEach(patient => {
            console.log(patient['00081190']);
        });
    });
}

function requestImage(token) {
    var url = 'https://143.54.220.73:8443/dcm4chee-arc/aets/DCM4CHEE/' +
        'wado?' +
        'requestType=WADO&' +
        'studyUID=1.2.392.200046.100.3.3.200137.15.20170223103559&' +
        'seriesUID=1.2.392.200046.100.3.3.200137.15.20170223103559.1&' +
        'objectUID=1.2.392.200046.100.3.3.200137.15.20170223103559.1.1.1&' +
        'contentType=image/jpeg&' +
        'frameNumber=1';

    var options = {
        method: 'GET',
        url: url,
        qs: {'00080061': ''},
        headers:
            {
                'Postman-Token': 'eee3ff1e-3e31-4ad8-a488-431281bf8a3f',
                'cache-control': 'no-cache',
                Authorization: 'Bearer ' + token
            }
    };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        // console.log(body);
    });

}

function requestTester(token) {

    var url = 'https://143.54.220.73:8443/dcm4chee-arc/aets/DCM4CHEE/' +
        'wado?' +
        'requestType=WADO&' +
        'studyUID=1.2.392.200046.100.3.3.200137.15.20170223103559&' +
        'seriesUID=1.2.392.200046.100.3.3.200137.15.20170223103559.1&' +
        'objectUID=1.2.392.200046.100.3.3.200137.15.20170223103559.1.1.1&' +
        'contentType=application/octet-stream&' +
        'frameNumber=1';

    var options = {
        method: 'GET',
        url: 'https://143.54.220.73:8443/dcm4chee-arc/aets/DCM4CHEE/wado',
        qs: {'00100020': 'teste'},
        headers:
            {
                'Postman-Token': 'eee3ff1e-3e31-4ad8-a488-431281bf8a3f',
                'cache-control': 'no-cache',
                Authorization: 'Bearer ' + token
            }
    };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body)
    });
}
