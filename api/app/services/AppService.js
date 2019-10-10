const request = require('request');
const https = require('https');
const AuthenticationService = require('./AuthenticationService');
const Constants = require('./Constants');
const RetinographyFactory = require('./RetinographyFactory');

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

var rets = [];
var study = {};
var token = null;
let AETS_NAME = 'DCM4CHEE';

/*===============*/

module.exports = {
    doit: doit
};

/*===============*/

function doit(rn, en) {
    return generateWADO({'patientID': rn, 'modality': en})
        .then(data => {
            return [{
                id: 'retinography',
                date: "2019-09-09T17:40:34.699Z",   //study date
                eye: 'left',                        //laterality
                result: JSON.stringify(data[0])
            }]
        });
}

/*==============*/

function generateWADO(searchOptions) {
    return AuthenticationService.authenticate()
        .then((resultToken) => {
            token = resultToken;
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
                    arr.push(requestImage(ret.seriesUID, instance))
                });
            });
            return Promise.all(arr)
                .then(result => {
                    console.log('====result====');
                    console.log(JSON.stringify(result));
                    return result;
                })
        })
}

function getStudyInformation(searchOptions) {
    return new Promise((resolve, reject) => {
        var studyOptions = {
            method: 'GET',
            url: 'https://' + DCM_HOST + ':' + ARC_PORT + '/dcm4chee-arc/aets/' + AETS_NAME + '/rs/studies',
            qs: {
                'PatientID': searchOptions.patientID,
                'ModalitiesInStudy': searchOptions.modality,
                'orderby': '-StudyDate,-StudyTime',
                'includedefaults': 'false',
                'includefield': 'StudyDate,RetrieveURL,StudyInstanceUID,NumberOfStudyRelatedSeries'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(studyOptions, function (error, response, body) {
                if (error) throw new Error(error);
                let parsed = JSON.parse(body);
                if (searchOptions.patientID === parsed[0][Constants.patientID].Value[0]) {
                    study.PatientID = parsed[0][Constants.patientID].Value[0];
                    study.Date = parsed[0][Constants.studyDate].Value[0];
                    study.URL = parsed[0][Constants.studyURL].Value[0];
                    study.UID = parsed[0][Constants.studyUID].Value[0];
                    study.numberOfSeriesInStudy = parsed[0][Constants.numberOfSeriesInStudy].Value[0];
                    resolve(study);
                } else {
                    //TODO: enviar algum tipo de erro de mismatch do PatientID;
                    console.log('ERROR: Patient ID mismatch, please review the requested recruitment number: <' + searchOptions.patientID + '> =/= <' + parsed[0]['00100020'].Value[0] + '>');
                }
            }
        );
    });
}

function getSeriesInformation(study) {
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

            parsed.forEach(serie => {
                if (serie[Constants.modality] && serie[Constants.modality].Value[0] === 'XC') { //todo is needed
                    let created = RetinographyFactory.create(serie, study);
                    console.log('created');
                    console.log(created);
                    rets.push(created);
                }
            });
            resolve(rets);
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
                'includefield': '00080018'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(instanceOptions, function (error, response, body) {
            if (error) throw new Error(error);
            let parsedBody = JSON.parse(body);
            console.log('The series number ' + retinography.seriesNumber + ' has ' + retinography.numberOfInstancesInSeries + ' instance(s): (' + retinography.laterality + ' eye)');

            for (i = 0; i < retinography.numberOfInstancesInSeries; i++) {
                retinography.instances.push(parsedBody[i]['00080018'].Value[0]);
            }
            console.log('=======study=============')
            console.log(study);
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