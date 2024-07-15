const axios = require("axios");

const uploadFileToFileNet = async function (payload) {
    try {
        let fileNetURL = '';
        if (payload.companycode == 'APL') {
            fileNetURL = process.env.APLFileNetURL || 'https://apidev.asianpaints.com/v1/test_filenet_letters_api/uploadFile'
        } else if (payload.companycode == 'APCO' || payload.companycode == 'APCL') {
            fileNetURL = process.env.CP2FileNetURL || 'https://apidev.asianpaints.com/v1/test_filenet_letters_api_cp2/uploadFile'
        }
        let config = {
            method: 'POST',
            url: fileNetURL,
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json'
            },
            data: {
                "file": payload.fileContent,
                "fileName": payload.fileName,
                "folderName": payload.empCode
            }
        };
        let res = await axios(config);
        console.info(`${config.data.fileName} Uploaded to FileNet Server`);
        return {
            isUploaded: true,
            apiResponse: res?.data
        };
    }
    catch (error) {
        console.error(`Error While Uploading ${config.data.fileName} to FileNet Server`);
        return {
            isUploaded: false,
            apiResponse: error?.message
        };
    }
}

module.exports = {
    uploadFileToFileNet
}