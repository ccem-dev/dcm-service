describe('RetinographyService.js Tests', function () {
    var service, assert;
    var Mock = {};
    var Injections = [];

    const expect = require('chai').expect;
    const sinon = require('sinon');

    beforeEach(function () {
        mocks();

        Injections.DcmApiService = require("../../app/services/DCMApiService");
        Injections.RetinographyFactory = require("../../app/models/RetinographyFactory");

        service = require("../../app/services/RetinographyService");
        assert = require("assert");

        sinon.stub(Injections.DcmApiService, "getStudyInformation").returns(Promise.resolve({}));
        sinon.stub(Injections.DcmApiService, "getSeriesInformation").returns(Promise.resolve([{}]));
        sinon.stub(Injections.DcmApiService, "getInstanceInformation").returns(Promise.resolve(Mock.instances));
        sinon.stub(Injections.DcmApiService, "requestImage").returns(Promise.resolve({}));
        sinon.stub(Injections.RetinographyFactory, "create").returns(Mock.Retinography);
    });

    afterEach(function () {
        sinon.restore();
    });

    it('getRetinographyMethod should execuded and return a response', function () {
        var result = service.getRetinography(Mock.token, Mock.study);
        expect(JSON.stringify(result)).to.deep.eql("{}");
    });

    function mocks() {
        Mock.Retinography = {
            patientID: 5007001,
            instances: [
                { Value: null }
            ],
            studyDate: "2019-03-01T14:07:00Z",
            studyUID: "97sd980saouizdfha76tdbivhcsdfn",
            seriesURL: "https://0.0.0.0/8080/dcm4chee-arc/aets/test/rs/studies",
            setInstances: function (item) {},
            addResult: function (item) {}
        };
        Mock.study = {
            date: "2019-03-01T14:07:00Z",
            patientID: 5007001,
            UID: "97sd980saouizdfha76tdbivhcsdfn",
            URL: "https://0.0.0.0/8080/dcm4chee-arc/aets/test/rs/studies"
        };
        Mock.instances = [
            { Value: null }
        ];
        Mock.token = "eyJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6ImFkb25pcy5nYXJjaWEuYWRnQGdtYWlsLmNvbSJ9.P6oNYBUI49tLo8G7hv6dMWNq4nTccifLHhQbxiXoRuQ";
    }
});