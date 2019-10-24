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

    });

    afterEach(function () {
        sinon.restore();
    });

    it('should return a Study not found message', function () {
        let studyWithWrongID = {patientID:40000};

        sinon.restore();
        sinon.stub(Injections.DcmApiService, "getStudyInformation").returns(Promise.resolve([studyWithWrongID]));
        sinon.stub(Injections.StudyFactory, 'create').returns(studyWithWrongID);

        service.getStudyInformation(Mock.token, Mock.searchOptions)
            .catch(err => {
                expect(err).to.eql('Study not found')
            });
    });

    describe('the qs adjustments according to sending', function () {
        var spy;
        beforeEach(function () {
            sinon.restore();
            spy = sinon.spy(Injections.DcmApiService, 'getStudyInformation');
        });

        afterEach(function () {
            sinon.restore();
        });

        it('should set direct order and limit to absolute value of sending', function () {
            let searchOptions = Mock.searchOptions;
            searchOptions.sending = 2;

            qs = {orderby: 'StudyDate,StudyTime', limit: 3};

            service.getStudyInformation(Mock.token, searchOptions);

            sinon.assert.calledWith(spy, Mock.token, searchOptions, qs);

        });

        it('should set reverse order and limit to absolute value of sending', function () {
            let searchOptions = Mock.searchOptions;
            searchOptions.sending = -2;

            qs = {orderby: '-StudyDate,-StudyTime', limit: 2};

            service.getStudyInformation(Mock.token, searchOptions);

            sinon.assert.calledWith(spy, Mock.token, searchOptions, qs);

        });

    });

    function mocks() {
        Mock.study = {
            patientID: 5007001
        };
        Mock.token = "eyJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6ImFkb25pcy5nYXJjaWEuYWRnQGdtYWlsLmNvbSJ9.P6oNYBUI49tLo8G7hv6dMWNq4nTccifLHhQbxiXoRuQ";
        Mock.searchOptions = {
            sending: 1,
            modality: 'XC',
            patientID: 5007001,
            recruitmentNumber: 5007001
        };
    }
});