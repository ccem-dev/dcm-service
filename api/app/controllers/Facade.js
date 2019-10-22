const AuthenticationService = require('../services/AuthenticationService');
const RetinographyService = require('../services/RetinographyService');
const StudyService = require('../services/StudyService');
const Constants = require('../utils/DCMConstants');
const Response = require('../utils/Response');


module.exports = {
    getRetinography: getRetinography
};

function getRetinography(searchOptions) {
    try {
        validateAndFormatSearchOptions(searchOptions);
    } catch (e) {
        return Promise.reject(Response.badRequest(e));
    }

    searchOptions.modality = Constants.RetinographyModality;

    let token;

    return AuthenticationService.authenticate()
        .then(authToken => {
            token = authToken;
            return StudyService.getStudyInformation(token, searchOptions)
        })
        .then(study => RetinographyService.getRetinography(token, study))
        .catch(err => {
            console.log(err);
            return Promise.reject(errorHandler(err));
        });

}

function errorHandler(err) {
    switch (err) {
        case 'Study not found': return Response.notFound();
        default:
            return Response.internalServerError();
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

}

/* todo:  \/ excluir \/  */

// cases();

function cases() {
    let so1 = [
        {recruitmentNumber: '0001', sending: '1'},
        {recruitmentNumber: '0001', sending: 1},
        {recruitmentNumber: '0001', sending: 0},
        {recruitmentNumber: 'asd', sending: '01'},
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
            // console.log(ix, so);
            // console.log(e);
        }
    });

    console.log('error counter = ', errorCounter)
}