const request = require('request');
const https = require('https');
const Constants = require('../utils/DCMConstants');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const {
    ARC_PORT,
    DCM_HOST,
    AETS_NAME
} = process.env;

var arc_port = ARC_PORT || '8443';

var dcm_host = DCM_HOST || '143.54.220.73';

let aets_name = AETS_NAME || 'DCM4CHEE';


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
            url: 'https://' + dcm_host + ':' + arc_port + '/dcm4chee-arc/aets/' + aets_name + '/rs/studies',
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
                try {
                    if (error) {
                        reject(error);
                    }
                    if (response.statusCode === 200) {
                        let parsed = JSON.parse(body);
                        resolve(parsed);
                    } else if (response.statusCode === 204) {
                        reject('Study not found');
                    } else {
                        reject('study error');
                    }
                } catch (e) {
                    reject(e);
                }
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

function requestImage(token, studyUID, seriesUID, instanceUID, qsOptions) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: dcm_host,
            port: arc_port,
            path: "/dcm4chee-arc/aets/" + aets_name + "/wado?",
            qs: {
                requestType: 'WADO',
                studyUID: studyUID,
                seriesUID: seriesUID,
                objectUID: instanceUID,
                contentType: 'image/jpeg',
                columns: '280',
                frameNumber: '1',
                ...qsOptions
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
