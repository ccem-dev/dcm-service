const request = require('request');
const https = require('https');
const Constants = require('../utils/DCMConstants');

const {
    DICOM_REQUEST_PORT,
    DICOM_REQUEST_HOSTNAME,
    AETS_NAME
} = process.env;

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
            url: 'https://' + DICOM_REQUEST_HOSTNAME + ':' + DICOM_REQUEST_PORT + '/dcm4chee-arc/aets/' + AETS_NAME + '/rs/studies',
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
                        reject('study error - ' + response.statusCode);
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
            hostname: DICOM_REQUEST_HOSTNAME,
            port: DICOM_REQUEST_PORT,
            path: "/dcm4chee-arc/aets/DCM4CHEE/wado?requestType=WADO" +
                "&studyUID=" + studyUID +
                "&seriesUID=" + seriesUID +
                "&objectUID=" + instanceUID,
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
