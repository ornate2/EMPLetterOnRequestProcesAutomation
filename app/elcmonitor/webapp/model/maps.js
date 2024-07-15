sap.ui.define([], function () {
    "use strict";

    return {
        getLabelByFieldNameForExcelDownload: function () {
            return Object.freeze({
                "empCode": "Emp Code",
                "title": "Title",
                "fullName": "Full Name",
                "eventReasonDescription": "Event Reason",
                "CommunicationStatus": "Communication Status",
                "CommunicationRemarks": "Communication Remarks",
                "IsEPUploaded": "EP Upload",
                "IsFileNetUploaded": "FileNet Upload",
                "effectiveDate": "Effective Date",
                "LetterTemplateDescription": "Letter Template",
                "email": "Employee Email",
                "MailResponse": "Mail Response",
                "EPResponse": "EP Response",
                "FileNetResponse": "FileNet Response"
            });
        }       
    };
});