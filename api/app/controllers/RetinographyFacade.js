const StudyService = require('../services/study-service');
const DcmApiService = require('../services/dcm-api-service.js');
const RetinographyFactory = require('../models/RetinographyFactory');
const AuthenticationService = require('../services/AuthenticationService');
const Constants = require('../utils/DCMConstants');

var self = this;


module.exports = {
    getRetinography: getRetinography
};

function getRetinography(searchOptions) {
    if (!searchOptions.recruitmentNumber) {
        throw new Error('RN not informed');
    }

    searchOptions.modality = 'XC';

    let token;

    return AuthenticationService.authenticate()
        .then((authToken) => {
            token = authToken;
            return StudyService.getStudyInformation(token, searchOptions);
        })
        .then(study => {
            return DcmApiService.getSeriesInformation(token, study.URL)
                .then(series => series.map(serie => RetinographyFactory.create(serie, study)));
        })
        .then(retinographies => {
            return Promise.all(retinographies.map(retinography => {
                return DcmApiService.getInstanceInformation(token, retinography.seriesURL)
                    .then(instances => {
                        retinography.setInstances(instances);
                        return Promise.all(instances.map(instanceUID => {
                            return DcmApiService.requestImage(token, retinography.studyUID, retinography.seriesUID, instanceUID)
                                .then(result => retinography.addResult(result));
                        }));
                    });
            })).then(() => retinographies);
        })
        .catch(err => {
            console.log('err');
            console.log(err);
        });

}
