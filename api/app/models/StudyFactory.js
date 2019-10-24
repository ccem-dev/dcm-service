const Constants = require('../utils/DCMConstants');

/*===============*/
module.exports = {
    create: create
};

/*===============*/

function create(studyObj) {
    return new Study(studyObj);
}

function Study(studyObj) {
    var self = this;

    self.patientID = studyObj[Constants.patientID].Value[0];
    self.date = studyObj[Constants.studyDate].Value[0];
    self.URL = studyObj[Constants.studyURL].Value[0];
    self.UID = studyObj[Constants.studyUID].Value[0];
    self.numberOfSeriesInStudy = studyObj[Constants.numberOfSeriesInStudy].Value[0];


    return self;
}