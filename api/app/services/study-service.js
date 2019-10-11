const DcmApiService = require('./dcm-api-service.js');
const Constants = require('./Constants');


function getStudyInformation(token, searchOptions) {
    var qs = {};

    searchOptions.patientID = searchOptions.recruitmentNumber;
    let sending = (searchOptions.sending === undefined || searchOptions.sending === null) ? -1 : searchOptions.sending;

    let targetIndex = sending;
    let requestLimit = sending + 1;
    if (sending < 0) {
        targetIndex = Math.abs(sending + 1);
        requestLimit = Math.abs(sending);
        qs = {orderby: '-StudyDate,-StudyTime', limit: requestLimit}
    } else {
        qs = {orderby: 'StudyDate,StudyTime', limit: requestLimit}
    }

    return DcmApiService
        .getStudyInformation(token, searchOptions, qs)
        .then(studies => {
            // if (searchOptions.patientID === targetStudy[Constants.patientID].Value[0]) {
            if (targetIndex > studies.length) {
                targetIndex = studies.length - 1;
            }
            let targetStudy = studies[targetIndex];
            let study = {};
            study.PatientID = targetStudy[Constants.patientID].Value[0];
            study.Date = targetStudy[Constants.studyDate].Value[0];
            study.URL = targetStudy[Constants.studyURL].Value[0];
            study.UID = targetStudy[Constants.studyUID].Value[0];
            study.numberOfSeriesInStudy = targetStudy[Constants.numberOfSeriesInStudy].Value[0];
            // } else {
            //     TODO: enviar algum tipo de erro de mismatch do PatientID;
            //     TODO: tratar erro quando "sending" > numberOfSeriesInStudy;
            // console.log('ERROR: Patient ID mismatch, please review the requested recruitment number: <' + searchOptions.patientID + '> =/= <' + targetStudy['00100020'].Value[0] + '>');
            // }
            return study;

        })
    
}

module.exports = {
    getStudyInformation: getStudyInformation
};