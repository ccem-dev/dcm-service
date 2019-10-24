describe('StudyFactory.js Tests', function () {
    var factory, assert;
    var Mock = {};
    var Injections = [];

    const expect = require('chai').expect;
    const sinon = require('sinon');

    beforeEach(function () {
        mocks();

        factory = require("../../app/models/StudyFactory");
        assert = require("assert");

    });

    afterEach(function () {
        sinon.restore();
    });

    it('createMethod should created an object', function () {
        var result = factory.create(Mock.studyObj);
        expect(JSON.stringify(result)).to.deep.eql(Mock.result);
    });

    function mocks() {
        Mock.result = "{\"patientID\":5007001,\"date\":\"2019-03-01T14:07:00Z\",\"URL\":\"https://0.0.0.0/8080/dcm4chee-arc/aets/test/rs/studies\",\"UID\":\"test\",\"numberOfSeriesInStudy\":\"test\"}";
        Mock.studyObj = {
            '00100020': {Value: [5007001]},
            '00080020': {Value: ["2019-03-01T14:07:00Z"]},
            '00081190': {Value: ["https://0.0.0.0/8080/dcm4chee-arc/aets/test/rs/studies"]},
            '00201206': {Value: ["test"]},
            '0020000D': {Value: ["test"]}
        }
    }
});