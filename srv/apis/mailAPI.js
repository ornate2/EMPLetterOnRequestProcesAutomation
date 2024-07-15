const sapEmailClient = require('@sap-cloud-sdk/mail-client');

const sendMail = async function (to, subject, message, attachments, cc) {
    try {
        _validateFromMail();
        _validateEmailDestination();
        var fromMail = process.env.DefaultEmail;
        var mailDestination = { destinationName: process.env.DefaultEmailDestination }
        var result = await sapEmailClient.sendMail(mailDestination,
            [{
                from: fromMail,
                to: to,
                subject: subject,
                html: message,
                attachments: attachments,
                cc: cc,
            }]);
        return {
            isMailSent: true,
            mailServerResponse: result
        };
    }
    catch (err) {
        console.error(`Mail send failed for ${to}`);
        console.log(err);
        return {
            isMailSent: false,
            mailServerResponse: err
        };
    }
}

_validateFromMail = function () {
    if (!process.env.DefaultEmail) {
        throw new Error(`Environment variable 'DefaultEmail' not maintained or blank`);
    }
}

_validateEmailDestination = function () {
    if (!process.env.DefaultEmailDestination) {
        throw new Error(`Environment variable 'DefaultEmailDestination' not maintained or blank`);
    }
}

module.exports = {
    sendMail
}