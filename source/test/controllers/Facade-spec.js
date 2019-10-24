describe('Facade.js Tests', function () {
    const AuthenticationService = require('../../app/services/AuthenticationService');
    const RetinographyService = require('../../app/services/RetinographyService');
    const StudyService = require('../../app/services/StudyService');
    const Constants = require('../../app/utils/DCMConstants');
    const Response = require('../../app/utils/Response');

    var Mock = {};
    const expect = require('chai').expect;
    const sinon = require('sinon');
    const assert = require("assert");
    var facade;

    beforeEach(function () {
        mocks();

        facade = require("../../app/controllers/Facade.js");
        sinon.restore();
    });

    describe('the validateAndFormatSearchOptions method', function () {
        it('should parse sending to int if possible', function () {
            let searchOptions = Mock.searchOptionsWithStringSending;
            facade.validateAndFormatSearchOptions(searchOptions);
            assert(searchOptions.sending === 1)
        });

        it('should throw error if parse is not possible', function () {
            let searchOptions = Mock.searchOptionsWithInvalidSending;
            try {
                facade.validateAndFormatSearchOptions(searchOptions);
            } catch (e) {
                assert(e.message === 'Malformed sending')
            }
        });

        it('should throw error if sending is empty', function () {
            let searchOptions = Mock.searchOptionsWithEmptySending;
            try {
                facade.validateAndFormatSearchOptions(searchOptions);
            } catch (e) {
                assert(e.message === 'Malformed sending')
            }
        });

        it('should throw error if recruitment number is empty', function () {
            let searchOptions = Mock.searchOptionsWithEmptyRecruitmentNumber;
            try {
                facade.validateAndFormatSearchOptions(searchOptions);
            } catch (e) {
                assert(e.message === 'Malformed recruitment number')
            }
        });

        it('should not throw error if search options is fine', function () {
            let searchOptions = Mock.searchOptions;
            try {
                facade.validateAndFormatSearchOptions(searchOptions);
            } catch (e) {
                assert.ok(false);
            }
        });
    });

    xdescribe('the getRetinography method', function () {
        it('should set modality to XC', function () {
            facade.getRetinography(Mock.searchOptions);
            assert(Mock.searchOptions.modality === 'XC')
        });

        it('should call errorHandler when an error occurs', function () {
            let errorMessage = 'Study not found';
            let res;
            let a = new Promise((resolve, reject)=> {res = reject;});
            var b = sinon.stub(StudyService, "getStudyInformation").returns(a);
            console.log(b)
            res(errorMessage)
            // var spy = sinon.spy(facade, ' errorHandler');
            // facade.getRetinography(Mock.searchOptions);
            //
            // sinon.assert.calledWith(spy, errorMessage);

        });
    });


    function mocks() {
        Mock.study = {
            patientID: "5007001"
        };

        Mock.token = "eyJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6ImFkb25pcy5nYXJjaWEuYWRnQGdtYWlsLmNvbSJ9.P6oNYBUI49tLo8G7hv6dMWNq4nTccifLHhQbxiXoRuQ";

        Mock.searchOptions = {
            sending: 1,
            recruitmentNumber: "5007001"
        };

        Mock.searchOptionsWithStringSending = {
            sending: '1',
            recruitmentNumber: "5007001"
        };

        Mock.searchOptionsWithInvalidSending = {
            sending: 'one',
            recruitmentNumber: "5007001"
        };

        Mock.searchOptionsWithEmptySending = {
            recruitmentNumber: "5007001"
        };

        Mock.searchOptionsWithEmptyRecruitmentNumber = {
            sending: '1'
        };

    }
});