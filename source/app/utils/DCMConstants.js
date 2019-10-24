let constant = {
    // VariableName - Dicom Element Tag - DICOM Keyword
    // Patient Level:
    patientID:                 '00100020', //PatientID

    // Study Level:
    studyDate:                 '00080020', // Study​Date
    studyURL:                  '00081190', // RetrieveURL
    numberOfSeriesInStudy:     '00201206', // Number​OfStudyRelated​Series
    studyUID:                  '0020000D', // Study​InstanceUID

    // Series Level:
    modality:                  '00080060', // Modality
    seriesURL:                 '00081190', // RetrieveURL
    seriesUID:                 '0020000E', // SeriesInstanceUID
    seriesNumber:              '00200011', // Series​Number
    laterality:                '00200060', // Laterality    /*Só funciona para XC*/
    numberOfInstancesInSeries: '00201209', // Number​OfSeries​RelatedInstances

    // Instance Level:
    InstanceUID:               '00080018',  // SOPInstanceUID

    //Modalities
    RetinographyModality: 'XC'
};

module.exports = constant;