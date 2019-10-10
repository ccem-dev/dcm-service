const request = require('request');
const https = require('https');
const AuthenticationService = require('./AuthenticationService');
const Constants = require('./Constants');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var ARC_PORT = '8443';
// var ARC_PORT = process.env['ARC_PORT'];

var DCM_HOST = '143.54.220.73';
// var DCM_HOST = process.env['DCM_HOST'];

// var searchOptions = {'patientID': '0002', 'modality': 'XC'};
// var searchOptions = {'patientID': '1941139', 'modality': 'US'};

// Variáveis no Postman para testes (Body): (Pode deletar)
//http://localhost:8081/api/retinography
// {"recruitmentNumber":"0002","examName":"Retinography","sending":0}

var study = {};
var token = null;
let AETS_NAME = 'DCM4CHEE';

/*===============*/


module.exports = {
    getStudyInformation: getStudyInformation,
    getSeriesInformation: getSeriesInformation,
    getInstanceInformation: getInstanceInformation,
    requestImage: requestImage
};

/*==============*/

function generateWADO(searchOptions) {
    return AuthenticationService.authenticate()
        .then((resultToken) => {
            token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwaC1fYVhjZ1FsTlVfNlZScWY4X0wxaWNGYkY1TXJZSlF2Q0s4M3JZcko4In0.eyJqdGkiOiI3MzdlZjMwNS1lMWFiLTQzYjMtYjdmNC0zM2ZkNzgzMGZkZjkiLCJleHAiOjE1NzA3Mzc1MzIsIm5iZiI6MCwiaWF0IjoxNTcwNzM3MjMyLCJpc3MiOiJodHRwczovLzE0My41NC4yMjAuNzM6ODg0My9hdXRoL3JlYWxtcy9kY200Y2hlIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImRlY2RkYjA4LWQxMDQtNDU2Ny04ZWVlLWRmMWI4MTRhZGIwNCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImN1cmwiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJlZjZmMzgxOC1lODNhLTRlM2EtYjA0YS1hOTYwZWQ3NWNmNGQiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJ1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJjbGllbnRJZCI6ImN1cmwiLCJjbGllbnRIb3N0IjoiMTQzLjU0LjIyMC43MyIsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1jdXJsIiwiY2xpZW50QWRkcmVzcyI6IjE0My41NC4yMjAuNzMiLCJlbWFpbCI6InNlcnZpY2UtYWNjb3VudC1jdXJsQHBsYWNlaG9sZGVyLm9yZyJ9.bbgc1XbLAJcSO9RRxuQKDPtMb7rRcQYKe1I0Ab88OEuOsebh3nyt-O0H3dDIgQ7UxTne2KJGSNeRcoy9gUG-t3aKyI-0Icgqs01i0hBzg7B5_2OblYMJd9mUxWeZcV6V6SBOFTgJA4P8UdH8TvNKTA1aeSktTHnGec6z3ShifYLJGKflWRkzIzKISvGvu2Adv3jSbD5gA6UQzHLvYLpV3L2lCN2FvwquujacXbD7I8RrJ540VYhfX2bFsDVH_h5rGVYtsgGrnn7OTfqa4lcqhuaU89jldfbhx9cRFMPkTULTEEdmlcsoXVQGDpvXJpdTbLpNXs4SlcwMcOYyb51oLg";
            // token = resultToken;
            return getStudyInformation(searchOptions)
        })
        .then((study) => {
            return getSeriesInformation(study)
        })
        .then((retinographys) => {
            let arr = [];
            retinographys.forEach(retin => {
                if (retin.modality === searchOptions.modality) {
                    arr.push(getInstanceInformation(retin))
                }
            });
            return Promise.all(arr)
                .then(result => {
                    return result;
                })
        })
        .then((retinographys) => {
            let arr = [];
            retinographys.forEach(ret => {
                console.log(ret);
                ret.instances.forEach(instance => {
                    let defer = requestImage(ret.seriesUID, instance);
                    arr.push(defer);
                    defer.then(result => {
                            ret.result.push(result)

                        }
                    );

                });
            });
            return Promise.all(arr)
                .then(result => {
                    console.log(retinographys);
                    return retinographys;
                })
        })
        .catch(error => {
            reject(error);

        })
}

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

function getSeriesInformation(token, study) {
    return new Promise((resolve, reject) => {
        var seriesOptions = {
            url: study.URL + '/series',
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

function getInstanceInformation(retinography) {
    return new Promise((resolve, reject) => {
        var instanceOptions = {
            method: 'GET',
            url: retinography.seriesURL + '/instances',
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
            // console.log('The series number ' + retinography.seriesNumber + ' has ' + retinography.numberOfInstancesInSeries + ' instance(s): (' + retinography.laterality + ' eye)');
            parsedBody.forEach(instance => {
                retinography.instances.push(instance[Constants.InstanceUID].Value[0]);
            });
            resolve(retinography);
        });
    });
}

function requestImage(seriesUID, instanceUID) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: DCM_HOST,
            port: ARC_PORT,
            path: "/dcm4chee-arc/aets/" + AETS_NAME + "/wado?",
            qs: {
                requestType: 'WADO',
                studyUID: study.UID,
                seriesUID: seriesUID,
                objectUID: instanceUID,
                contentType: 'image/jpeg',
                columns: '280',
                frameNumber: '1'
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
