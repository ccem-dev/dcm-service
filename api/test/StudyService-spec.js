describe('StudyService.js Tests', function () {
    var service, assert;
    var Mock = {};
    var Injections = [];

    const expect = require('chai').expect;
    const sinon = require('sinon');

    beforeEach(function () {
        mocks();

        Injections.DcmApiService = require("../app/services/DCMApiService");
        Injections.StudyFactory = require("../app/models/StudyFactory");

        service = require("../app/services/StudyService");
        assert = require("assert");

        sinon.stub(Injections.DcmApiService, "getStudyInformation").returns(Promise.resolve({}));
        sinon.stub(Injections.StudyFactory, "create").returns(Mock.patientID);

    });

    it('getStudyInformationMethod should execuded', function () {
        var result = service.getStudyInformation(Mock.token, Mock.search);
        expect(JSON.stringify(result)).to.deep.eql("{}");
    });

    function mocks() {
        Mock.patientID = {
            patientID:5007001
        };
        Mock.token = "eyJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6ImFkb25pcy5nYXJjaWEuYWRnQGdtYWlsLmNvbSJ9.P6oNYBUI49tLo8G7hv6dMWNq4nTccifLHhQbxiXoRuQ";
        Mock.search = {
            recruitmentNumber : 5007001
        };
    }
});