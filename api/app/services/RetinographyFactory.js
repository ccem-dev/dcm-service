const Constants = require('./Constants');

var self = this;
self.create = create;

module.exports = self;

function create(serieObject, study) {
    return new Retinography(serieObject, study);
}

function Retinography(jsonObject, study) {
    var self = this;

    self.toJSON = toJSON;


    self.studyDate = study.Date;
    self.patientID = study.PatientID;

    self.result = [];
    self.instances = [];
    self.modality = jsonObject[Constants.modality].Value[0];
    self.seriesUID = jsonObject[Constants.seriesUID].Value[0];
    self.seriesNumber = jsonObject[Constants.seriesNumber].Value[0];
    self.numberOfInstancesInSeries = jsonObject[Constants.numberOfInstancesInSeries].Value[0];
    self.seriesURL = jsonObject[Constants.seriesURL].Value[0];
    self.laterality = jsonObject[Constants.laterality].Value[0];



    function toJSON() {
        let obj = {};
        obj.date = self.date;
        obj.eye = self.laterality === 'L' ? 'left' : 'right';
        obj.result = JSON.stringify(self.result);
        return obj;
    }

    return self;
}

