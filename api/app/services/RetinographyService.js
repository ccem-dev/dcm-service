const StudyService = require('./StudyService');
const DcmApiService = require('./DCMApiService.js');
const RetinographyFactory = require('../models/RetinographyFactory');
const AuthenticationService = require('./AuthenticationService');

module.exports = {
    getRetinography: getRetinography
};

function getRetinography(searchOptions) {
    if (!searchOptions.recruitmentNumber) {
        throw new Error('RN not informed');
    }

    let token;

    return authenticate()
        .then(study => fetchRetinographies(study))
        .then(retinographies => get(retinographies))
        .catch(err => {
            console.log('err');
            console.log(err);
        });

    function get(retinographies) {
        return Promise.all(retinographies.map(retinography => {
            return getRetinographyInstances(token, retinography)
                .then(instances => {
                    retinography.setInstances(instances);
                    return requestImages(token, retinography, instances);
                });
        })).then(() => retinographies);
    }

    function authenticate() {
        return AuthenticationService.authenticate()
            .then((authToken) => {
                token = authToken;
                return StudyService.getStudyInformation(token, searchOptions);
            });
    }

    function fetchRetinographies(study) {
        return DcmApiService.getSeriesInformation(token, study.URL)
            .then(series => series.map(serie => RetinographyFactory.create(serie, study)));
    }

    function getRetinographyInstances(token, retinography) {
        return DcmApiService.getInstanceInformation(token, retinography.seriesURL);
    }

    function requestImages(token, retinography, instances) {
        return Promise.all(instances.map(instanceUID => {
            return DcmApiService.requestImage(token, retinography.studyUID, retinography.seriesUID, instanceUID)
                .then(result => retinography.addResult(result));
        }));
    }
}

function validateAndFormatSearchOptions(searchOptions) {
    let rn = searchOptions.recruitmentNumber;
    let sending = searchOptions.sending;

    if (!(rn &&
        typeof rn === 'string')) {
        throw new Error('Malformed recruitment number');
    } else {
        searchOptions.patientID = searchOptions.recruitmentNumber;
    }

    if (!sending) {
        if (sending !== 0) {
            throw new Error('Malformed sending');
        }
    } else {
        if (isNaN(parseInt(sending))) {
            throw new Error('Malformed sending');
        } else {
            searchOptions.sending = parseInt(searchOptions.sending);
        }
    }
    searchOptions.modality = 'XC';

}

cases();

function cases() {
    let so1 = [{recruitmentNumber: '0001', sending: '1'},
        {recruitmentNumber: '0001', sending: 1},
        {recruitmentNumber: '0001', sending: 0},
        {recruitmentNumber: '0001', sending: '0'},
        //====== errors
        {recruitmentNumber: '0001', sending: 'onze'},
        {recruitmentNumber: '0001', sending: NaN},
        {recruitmentNumber: '0001', sending: undefined},
        {recruitmentNumber: '0001', sending: null},
        {sending: '0'},
        {recruitmentNumber: '0001'}
    ];

    let errorCounter = 0;
    so1.forEach((so, ix) => {
        try {
            validateAndFormatSearchOptions(so);
            console.log(so)
        } catch (e) {
            errorCounter++;
            console.log(ix, so);
            console.log(e);
        }
    });

    console.log('error counter = ', errorCounter)
}