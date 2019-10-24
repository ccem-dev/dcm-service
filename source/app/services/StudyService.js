const DcmApiService = require('./DCMApiService.js');
const StudyFactory = require('../models/StudyFactory')

/*===============*/
module.exports = {
    getStudyInformation: getStudyInformation
};

/*===============*/

function getStudyInformation(token, searchOptions) {
    var qs = {};


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
            if (targetIndex >= studies.length) {
                targetIndex = studies.length - 1;
            }
            let targetStudy = studies[targetIndex];
            let study = StudyFactory.create(targetStudy);
            if (searchOptions.patientID !== study.patientID) {
                return Promise.reject('Study not found');
            }
            return study;

        })

}
