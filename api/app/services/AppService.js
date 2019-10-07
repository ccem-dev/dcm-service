const request = require('request');
const https = require('https');
const AuthenticationService = require('./AuthenticationService');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var ARC_PORT = '8443';
// var ARC_PORT = process.env['ARC_PORT'];

var DCM_HOST = '143.54.220.73';
// var DCM_HOST = process.env['DCM_HOST'];


var searchOptions = {'patientID': '0002', 'modality': 'XC'};
// var searchOptions = {'patientID': '1941139', 'modality': 'US'};

var study = {};
var series = {
    'number': [],
    'Modality': [],
    'UID': [],
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

function doit(rn) {
    return generateWADO( {'patientID': rn, 'modality': 'XC'})
        .then(data => {
            return [{
                // id: 'retinography',
                date: "2019-09-09T17:40:34.699Z", //study date
                eye: 'left',        //laterality
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
        .then((series) => {
            let arr = [];
            console.log();
            console.log('Instance Level:');
            for (s = 0; s < study.numberOfSeries; s++) {
                if (series.Modality[s] === searchOptions.modality) {
                    var serie = {};
                    serie.URL = series.URL[s];
                    serie.laterality = series.laterality[s];
                    serie.numberOfInstancesInSeries = series.numberOfInstancesInSeries[s];
                    serie.instances = series.instances;
                    serie.number = series.number[s];
                    arr.push(getInstanceInformation(serie))
                }
            }
            return Promise.all(arr)
                .then(result => {
                    return result;
                })
        })
        .then(() => {
            let arr = [];
            for (s = 0; s < study.numberOfSeries; s++) {
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
            url: 'https://' + DCM_HOST + ':' + ARC_PORT + '/dcm4chee-arc/aets/'+AETS_NAME+'/rs/studies',
            qs: {
                'PatientID': searchOptions.patientID,
                'ModalitiesInStudy': searchOptions.modality,
                'orderby': '-StudyDate,-StudyTime',
                'includedefaults': 'false',
                'includefield': '0020000D,00081190,00201206,00201208'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(studyOptions, function (error, response, body) {
            if (error) throw new Error(error);
            study.UID = JSON.parse(body)[0]['0020000D'].Value[0];                      //Study Instance UID
            study.URL = JSON.parse(body)[0]['00081190'].Value[0];                      //Retrieve URL
            study.numberOfSeries = JSON.parse(body)[0]['00201206'].Value[0];           //Number of Study Related Series
            study.numberOfInstances = JSON.parse(body)[0]['00201208'].Value[0];        //Number of Study Related Instances
            console.log();
            console.log('Study Level:');
            console.log('Last study UID: ' + study.UID);
            resolve(study);
        });
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
                'includefield': '00080060,0020000E,00200011,00201209,00081190,00200060'
            },
            headers: {'cache-control': 'no-cache', Authorization: 'Bearer ' + token}
        };
        request(seriesOptions, function (error, response, body) {
            if (error) throw new Error(error);
            console.log('Number of series in study: ' + study.numberOfSeries);
            console.log('Number of instances in study: ' + study.numberOfInstances);
            console.log();
            console.log('Series Level:');
            for (var s = 0; s < study.numberOfSeries; s++) {
                series.Modality[s] = JSON.parse(body)[s]['00080060'].Value[0];                          //Modality
                if (series.Modality[s] === searchOptions.modality) {
                    // console.log('ok');
                    series.UID[s] = JSON.parse(body)[s]['0020000E'].Value[0];                               //Series Instance UID
                    series.number[s] = JSON.parse(body)[s]['00200011'].Value[0];                            //Series Number
                    series.numberOfInstancesInSeries[s] = JSON.parse(body)[s]['00201209'].Value[0];         //Number of Series Related Instances
                    series.URL[s] = JSON.parse(body)[s]['00081190'].Value[0];                               //Retrieve URL
                    series.laterality[s] = JSON.parse(body)[s]['00200060'].Value[0];                        //Laterality
                    console.log('Series number ' + series.number[s] + ': ' + series.laterality[s] + ', ' + series.UID[s]);
                }
            }
            resolve(series);
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
            path: "/dcm4chee-arc/aets/"+ AETS_NAME + "/wado?",
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