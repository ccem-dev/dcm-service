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

var study = {};
var rets = [];
var series = {
    'Date': [],
    'number': [],
    'Modality': [],
    'UID': [],
    'PatientID': [],
    'URL': [],
    'laterality': [],
    'numberOfInstancesInSeries': [],
    'instances': {}
};
var token = null;
let AETS_NAME = 'DCM4CHEE';

/*===============*/
module.exports = {
    doit: doit
};

/*===============*/

function doit(rn,en) {
    return generateWADO({'patientID': rn, 'modality': en})
        .then(data => {
            // console.log(series);
            return [{
                // id: 'retinography',
                date: "2019-09-09T17:40:34.699Z",   //study date
                eye: 'left',                        //laterality
                result: JSON.stringify(data[0])
            }]
        });

    // [
    // {
    //     // id: 'retinography',
    //     date: "2019-09-09T17:40:34.699Z", //study date
    //     eye: 'left',        //laterality
    //     result: JSON.stringify(data)
    // },
    //     {
    //         // id: 'retinography',
    //         date: "2019-09-09T17:40:34.699Z", //study date
    //         eye: 'left',        //laterality
    //         result: JSON.stringify(data)
    //     }
    // ]
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
            console.log();
            // console.log(retinographys);
            let arr = [];

            // console.log('Instance Level:');
            // for (s = 0; s < study.numberOfSeriesInStudy; s++) {
            //     if (retinographys.Modality[s] === searchOptions.modality) {
            //         var serie = {};
            //         serie.URL = retinographys.URL[s];
            //         serie.laterality = retinographys.laterality[s];
            //         serie.numberOfInstancesInSeries = retinographys.numberOfInstancesInSeries[s];
            //         serie.instances = retinographys.instances;
            //         serie.number = retinographys.number[s];
            //         arr.push(getInstanceInformation(serie))
            //     }
            // }

            retinographys.forEach(retin => {
                console.log(retin);
                // arr.push(getInstanceInformation(retin))
            });
            return Promise.all(arr)
                .then(result => {
                    return result;
                })
        })
        .then(() => {
            let arr = [];
            for (s = 0; s < study.numberOfSeriesInStudy; s++) {
                for (i = 0; i < series.numberOfInstancesInSeries[s]; i++) {
                    arr.push(requestImage(s, i));
                }
            }
            return Promise.all(arr)
                .then(result => {
                    console.log();
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
                    study.numberOfSeriesInStudy = parsed[0][Constants.numberOfSeriesInStudy].Value[0];
                    study.UID = parsed[0][Constants.studyUID].Value[0];
                    console.log();
                    console.log('Study Level:');
                    console.log('Patient ID: ' + study.PatientID);
                    console.log('Last study UID: ' + study.UID);
                    console.log('Study Date: ' + study.Date);
                    resolve(study);
                }else{
                    //TODO: enviar algum tipo de erro de mismatch do PatientID;
                    console.log('ERROR: Patient ID mismatch, please review the requested recruitment number: <'+searchOptions.patientID+'> =/= <'+parsed[0]['00100020'].Value[0]+'>');
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
                'includefield': '00080020,00080060,00081190,0020000E,00200011,00201209,00200060'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(seriesOptions, function (error, response, body) {
            if (error) throw new Error(error);
            console.log('Number of series in study: ' + study.numberOfSeriesInStudy);
            console.log();
            console.log('Series Level:');
            let parsed = JSON.parse(body);
            for (var s = 0; s < study.numberOfSeriesInStudy; s++) {
                let retinography = RetinographyFactory.create();
                rets.push(retinography);
                retinography.modality = parsed[s][Constants.modality].Value[0];                              //Modality
                if (retinography.modality === 'XC') {
                    retinography.date = study.Date;
                    retinography.patientID = study.PatientID;

                    retinography.UID = parsed[s]['0020000E'].Value[0];                               //Series Instance UID
                    retinography.number = parsed[s]['00200011'].Value[0];                            //Series Number
                    retinography.numberOfInstancesInSeries = parsed[s]['00201209'].Value[0];         //Number of Series Related Instances
                    retinography.URL = parsed[s]['00081190'].Value[0];                               //Retrieve URL
                    retinography.laterality = parsed[s][Constants.laterality].Value[0];                        //Laterality
                    console.log('Series number ' + retinography.number + ': ' + retinography.laterality + ', ' + retinography.UID);
                }
            }
            resolve(rets);
        });
    });
}

function getInstanceInformation(series) {
    return new Promise((resolve, reject) => {
        var listOfInstances = [];
        var instanceOptions = {
            method: 'GET',
            url: series.URL + '/instances',
            qs: {
                'orderby': 'InstanceNumber',
                'includedefaults': 'false',
                'includefield': '00080018'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(instanceOptions, function (error, response, body) {
            if (error) throw new Error(error);
            console.log('The series number ' + series.number + ' has ' + series.numberOfInstancesInSeries + ' instance(s): (' + series.laterality + ' eye)');
            for (i = 0; i < series.numberOfInstancesInSeries; i++) {
                listOfInstances[i] = JSON.parse(body)[i]['00080018'].Value[0];
                console.log(listOfInstances[i]);
            }
            series.instances[series.number] = listOfInstances;

            console.log();
            resolve(study.instances);
        });
    });
}

function requestImage(s, i) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: DCM_HOST,
            port: ARC_PORT,
            path: "/dcm4chee-arc/aets/" + AETS_NAME + "/wado?",
            qs: {
                requestType: 'WADO',
                studyUID: study.UID,
                seriesUID: series.UID[s],
                objectUID: series.instances[series.number[s]][i],
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