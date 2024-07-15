const SapCfAxios = require('sap-cf-axios').default;

const renderPDF = async function (base64XMLData, xdpTemplate) {
    try {
        const cfAxios = SapCfAxios("adobeformapi");
        const response = await cfAxios({
            method: 'POST',
            url: '/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0',
            data: {
                "xdpTemplate": xdpTemplate,
                "xmlData": base64XMLData,
                "formType": "print",
                "formLocale": "",
                "taggedPdf": 1,
                "embedFont": 0
            },
            headers: {
                "content-type": "application/json"
            }
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

module.exports = {
    renderPDF
}