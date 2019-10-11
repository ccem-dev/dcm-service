const StudyService = require('./study-service');
const DcmApiService = require('./dcm-api-service.js');
const RetinographyFactory = require('./retinography-factory');
const AuthenticationService = require('./AuthenticationService');
const Constants = require('./Constants');

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
            //todo: call series
            return DcmApiService.getSeriesInformation(token, study).then(series => {
                let rets = [];
                series.forEach(serie => {
                    if (serie[Constants.modality] && serie[Constants.modality].Value[0] === 'XC') { //todo is needed
                        let created = RetinographyFactory.create(serie, study);
                        console.log('retinography');
                        console.log(created);
                        rets.push(created);
                    }
                });
                return rets;
            });
        })
        .then(retinographies => {
            return retinographies;
            //todo: get instances
        });

}