const DcmApiService = require('./DCMApiService.js');
const Constants = require('../utils/DCMConstants');
const StudyFactory = require('../models/StudyFactory')

/*===============*/
module.exports = {
    getStudyInformation: getStudyInformation
};

/*===============*/

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
            if (targetIndex > studies.length) {
                targetIndex = studies.length - 1;
            }
            let targetStudy = studies[targetIndex];
            let study = StudyFactory.create(targetStudy);
            console.log(study);
            if (searchOptions.patientID !== study.patientID) {
                //     TODO: enviar algum tipo de erro de mismatch do PatientID;
                //     TODO: tratar erro quando "sending" > numberOfSeriesInStudy;
                console.log('ERROR: Patient ID mismatch, please review the requested recruitment number: <' + searchOptions.patientID + '> =/= <' + study.patientID + '>');
            }
            return study;

        })

}
