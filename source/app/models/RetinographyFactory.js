const Constants = require('../utils/DCMConstants');

var self = this;
self.create = create;

module.exports = self;

function create(serieObject, study) {
    if (serieObject[Constants.modality] && serieObject[Constants.modality].Value[0] === 'XC') {
        return new Retinography(serieObject, study);
    }
}

function Retinography(jsonObject, study) {
    var self = this;

    self.addInstance = addInstance;
    self.setInstances = setInstances;
    self.addResult = addResult;
    self.toJSON = toJSON;


    self.studyDate = study.date;
    self.patientID = study.patientID;
    self.studyUID = study.UID;

    self.result = [];
    self.instances = [];
    self.modality = jsonObject[Constants.modality].Value[0];
    self.seriesUID = jsonObject[Constants.seriesUID].Value[0];
    self.seriesNumber = jsonObject[Constants.seriesNumber].Value[0];
    self.numberOfInstancesInSeries = jsonObject[Constants.numberOfInstancesInSeries].Value[0];
    self.seriesURL = jsonObject[Constants.seriesURL].Value[0];
    self.laterality = jsonObject[Constants.laterality].Value[0];


    function addInstance(instanceObj) {
        self.instances.push(instanceObj[Constants.InstanceUID].Value[0]);
    }

    function setInstances(instanceObjs) {
        instanceObjs.forEach(instanceObj => self.instances.push(instanceObj[Constants.InstanceUID].Value[0]));
    }

    function addResult(result) {
        if (result) {
            self.result.push(result);
        }
    }

    function toJSON() {
        let obj = {};
        obj.date = formatDate(self.studyDate);
        obj.eye = self.laterality === 'L' ? 'left' : 'right';
        obj.result = JSON.stringify(self.result);
        return obj;
    }

    function formatDate(dateString) {
        let formattedString = dateString.slice(0, 4) + "-" + dateString.slice(4, 6) + "-" + dateString.slice(6, 8);
        return new Date(formattedString).toISOString();
    }

    return self;
}

