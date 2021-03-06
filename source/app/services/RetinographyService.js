const DcmApiService = require('./DCMApiService.js');
const RetinographyFactory = require('../models/RetinographyFactory');
const AuthenticationService = require('./AuthenticationService');
const Constants = require('../utils/DCMConstants');

module.exports = {
    getRetinography: getRetinography
};

function getRetinography(token, study) {
    try {
        return fetchRetinographies(study)
            .then(retinographies => processInstances(retinographies))
            .catch(err => {
                return Promise.reject(err);
            });
    } catch (e) {
        return Promise.reject(e);
    }

    function processInstances(retinographies) {
        return Promise.all(retinographies.map(retinography => {
            return getRetinographyInstances(token, retinography)
                .then(instances => {
                    retinography.setInstances(instances);
                    return requestImages(token, retinography, instances);
                });
        })).then(() => retinographies);
    }

    function fetchRetinographies(study) {
        return DcmApiService.getSeriesInformation(token, study.URL)
            .then(series => series.map(serie => RetinographyFactory.create(serie, study)));
    }

    function getRetinographyInstances(token, retinography) {
        return DcmApiService.getInstanceInformation(token, retinography.seriesURL);
    }

    function requestImages(token, retinography, instances) {
        return Promise.all(retinography.instances.map(instanceUID => {
            return DcmApiService.requestImage(token, retinography.studyUID, retinography.seriesUID, instanceUID)
                .then(result => retinography.addResult(result));
        }));
    }
}
