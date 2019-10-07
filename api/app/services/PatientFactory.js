var self = this;
self.create = create;
self.fromJson = fromJson;

module.exports = self;

function create() {
    return new Patient();
}

function fromJson(jsonObject) {
    return new Patient(jsonObject);
}

function Patient(jsonObject) {
    var self = this;
    self.patientID = jsonObject.patientID;


    function requestStudies() {

    }
    return self;
}

