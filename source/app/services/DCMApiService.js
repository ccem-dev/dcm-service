const request = require('request');
const https = require('https');
const AuthenticationService = require('./AuthenticationService');
const Constants = require('../utils/DCMConstants');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var ARC_PORT = '8443';
// var ARC_PORT = process.env['ARC_PORT'];

var DCM_HOST = '143.54.220.73';
// var DCM_HOST = process.env['DCM_HOST'];

let AETS_NAME = 'DCM4CHEE';
// var searchOptions = {'patientID': '0002', 'modality': 'XC'};
// var searchOptions = {'patientID': '1941139', 'modality': 'US'};

// Variáveis no Postman para testes (Body): (Pode deletar)
//http://localhost:8081/api/retinography
// {"recruitmentNumber":"0002","examName":"Retinography","sending":0}


/*===============*/
module.exports = {
    getStudyInformation: getStudyInformation,
    getSeriesInformation: getSeriesInformation,
    getInstanceInformation: getInstanceInformation,
    requestImage: requestImage
};
/*==============*/

function getStudyInformation(token, searchOptions, qsOptions) {
    return new Promise((resolve, reject) => {
        var studyOptions = {
            method: 'GET',
            url: 'https://' + DCM_HOST + ':' + ARC_PORT + '/dcm4chee-arc/aets/' + AETS_NAME + '/rs/studies',
            qs: {
                'PatientID': searchOptions.patientID,
                'ModalitiesInStudy': searchOptions.modality,
                'orderby': 'StudyDate,StudyTime',
                'includedefaults': 'false',
                'includefield': 'StudyDate,RetrieveURL,StudyInstanceUID,NumberOfStudyRelatedSeries',
                ...qsOptions
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(studyOptions, function (error, response, body) {
                if (error) throw new Error(error);
                let parsed = JSON.parse(body);
                resolve(parsed);
            }
        );
    });
}

function getSeriesInformation(token, studyURL) {
    return new Promise((resolve, reject) => {
        var seriesOptions = {
            url: studyURL + '/series',
            method: 'GET',
            qs: {
                'orderby': 'SeriesNumber',
                'includedefaults': 'false',
                'includefield': 'Modality,RetrieveURL,SeriesInstanceUID,SeriesNumber,NumberOfSeriesRelatedInstances,Laterality'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(seriesOptions, function (error, response, body) {
            if (error) throw new Error(error);
            let parsed = JSON.parse(body);
            resolve(parsed);
        });
    });
}

function getInstanceInformation(token, seriesURL) {
    return new Promise((resolve, reject) => {
        var instanceOptions = {
            method: 'GET',
            url: seriesURL + '/instances',
            qs: {
                'orderby': 'InstanceNumber',
                'includedefaults': 'false',
                'includefield': Constants.InstanceUID
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(instanceOptions, function (error, response, body) {
            if (error) throw new Error(error);
            let parsedBody = JSON.parse(body);
            resolve(parsedBody);
        });
    });
}

function requestImage(token, studyUID, seriesUID, instanceUID, qtOptions) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: DCM_HOST,
            port: ARC_PORT,
            path: "/dcm4chee-arc/aets/" + AETS_NAME + "/wado?",
            qs: {
                requestType: 'WADO',
                studyUID: studyUID,
                seriesUID: seriesUID,
                objectUID: instanceUID,
                contentType: 'image/jpeg',
                columns: '280', //todo remove
                frameNumber: '1',
                ...qtOptions
            },
            headers: {
                'Authorization': 'Bearer ' + token,
                "cache-control": "no-cache",
                "Content-Type": "image/jpeg"
            }
        };
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
