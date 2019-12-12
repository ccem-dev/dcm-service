describe('RetinographyFactory.js Tests', function () {
    var factory, assert;
    var Mock = {};
    var Injections = [];

    const expect = require('chai').expect;
    const sinon = require('sinon');

    beforeEach(function () {
        mocks();

        factory = require("../../app/models/RetinographyFactory");
        assert = require("assert");

    });

    afterEach(function () {
        sinon.restore();
    });

    it('createMethod should created an object', function () {
        var result = factory.create(Mock.serieObject, Mock.study);
        expect(JSON.stringify(result)).to.deep.eql(Mock.result);
    });

    function mocks() {
        Mock.result = "{\"date\":\"2019-03-01T00:00:00Z\",\"eye\":\"right\",\"result\":\"[]\"}";
        Mock.study = {
            date: "20190301",
            patientID: 5007001,
            UID: "97sd980saouizdfha76tdbivhcsdfn"
        };
        Mock.serieObject = {
            '00080060': {Value: ['XC']},
            '0020000E': {Value: ["97sd980saouizdfha76tdbivhcsdfn"]},
            '00081190': {Value: ["https://0.0.0.0/8080/dcm4chee-arc/aets/test/rs/studies"]},
            '00200011': {Value: ["test"]},
            '00201209': {Value: ["test"]},
            '00200060': {Value: ["test"]}
        }
    }
});
