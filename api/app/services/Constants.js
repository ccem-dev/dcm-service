let constant = {
    // Patient Level:
    patientID:                 '00100020',

    // Study Level:
    studyDate:                 '00080020',
    studyURL:                  '00081190',
    numberOfSeriesInStudy:     '00201206',
    studyUID:                  '0020000D',

    // Series Level:
    modality:                  '00080060',
    seriesUID:                 '0020000E',
    seriesNumber:              '00200011',
    laterality:                '00200060',   //só funciona para XC
    numberOfInstancesInSeries: '00201209',
};

module.exports = constant;