var self = this;
self.create = create;
self.fromJson = fromJson;

module.exports = self;

function create() {
    return new Retinography({});
}

function fromJson(jsonObject) {
    return new Retinography(jsonObject);
}

function Retinography(jsonObject) {
    var self = this;

    self.toJSON = toJSON;

    self.patientID = jsonObject.patientID;
    // self.date = jsonObject.date;
    self.laterality = jsonObject.eye;
    self.result = jsonObject.result;

    function toJSON() {
        let obj = {};
        obj.date = self.date;
        obj.eye = self.laterality;
        obj.result = JSON.stringify(self.result);
        return obj;
    }

    return self;
}

