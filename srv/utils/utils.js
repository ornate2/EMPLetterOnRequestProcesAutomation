const fs = require('fs');
const dao = require("./dao");
const sfAPI = require("../apis/successFactorsAPI");
const global = require("./global")

const TITLE_BY_SALUTATIONION_CODE = {
    "534": "Doctor",
    "535": "Mr.",
    "536": "Mrs.",
    "537": "Captain",
    "538": "Ms.",
    "278161": "Mx.",
    //Dev Salutation Code
    "20507": "Doctor",
    "16268": "Mr.",
    "16269": "Mrs.",
    "20508": "Captain",
    "16270": "Ms.",
    "514301": "Mx.",
};

const COMPANY_CODE = {
    "APL": "APL",
    "APCO": "APCO",
    "APCL": "APCL",
    "APPG": "APPG",
    "RIPL": "RIPL"
}

const EVENT_TYPE = {
    "PRBCOM": "Confirmation",
    "PRBEXT": "Probation Extension",
    "PROMO": "Promotion",
    "PROMOWTRANS": "Promotion with transfer",
    "TRANBU": "Transfer - Vertical Change",
    "TRANFUNC": "Transfer - Function Change",
    "TRANICOT": "Inter Company Transfer",
    "TRANDEPT": "Transfer - Department Change",
    "TRANDIV": "Transfer - Division_Plant_HO Change",
    "TRANLOC": "Transfer - Location Change"
}

const readXMLPayloadTemplate = async function (path) {
    let xml_string = fs.readFileSync(path, "utf8");
    return xml_string;
}

const filterOutUndefineAndNull = async function (value) {
    if (value) {
        return value.toString().replace('&', '&amp;');
    }
    return '';
}

const filterOutUndefine = async function (value) {
    if (value != 'undefined') {
        return value;
    }
    return '';
}

const calculateStartDate = async function () {
    var startDate = new Date();
    var sd = new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' });
    let days = process.env.ELC_Days || 3;
    var day = startDate.getTime() - (days * 24 * 60 * 60 * 1000);
    startDate.setTime(day);
    return `${startDate.toISOString().split('T')[0]}`;
}

const calculateEndDate = async function () {
    var endDate = new Date();
    var day = endDate.getTime() + (1 * 24 * 60 * 60 * 1000);
    endDate.setTime(day);
    return `${endDate.toISOString().split('T')[0]}`;
}

const processELCData = async function (wfRequestData) {
    let salutationCode;
    let elc;
    let elcData = [];

    let elcExclusionsByCompanyCodes = _transformToELCExclusionsMap(await dao.getELCExclusions());
    let elcPromoExclusionsByCompanyCodes = _transformToELCExclusionsMap(await dao.getELCPromoExclusions()); 

    let endDate = new Date(await calculateEndDate());
    for (const element of wfRequestData) {
        let eventType = element.empWfRequestNav.eventReason;
        let companyCode = element.empWfRequestNav.jobInfoNav[0]?.company;
        let payGrade = element.empWfRequestNav.jobInfoNav[0]?.payGrade;
        let effectiveDate = new Date(element.empWfRequestNav.effectiveDate);
        let division = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.division);
        if (!COMPANY_CODE[companyCode]) {
            continue;
        }
        if (!EVENT_TYPE[eventType]) {
            continue;
        }
        if (elcExclusionsByCompanyCodes[companyCode] && elcExclusionsByCompanyCodes[companyCode][payGrade]) {
            continue;
        }
        if ((eventType == 'PROMO' || eventType == 'PROMOWTRANS') && elcPromoExclusionsByCompanyCodes[companyCode] && elcPromoExclusionsByCompanyCodes[companyCode][payGrade]) {
            continue;
        }
        
        if ((eventType == "PROMO" || eventType == "PROMOWTRANS") && (payGrade == "C/H2" || payGrade == "A/SA") && division == "TALOJA"){
            continue;
        }
        
        /*if (effectiveDate >= endDate) {
            continue;
        }*/
        
        elc = {};
        elc.wfRequestId = element.wfRequestId;
        elc.lastModifiedOn = element.lastModifiedOn;
        elc.empWfRequestId = element.empWfRequestNav.empWfRequestId;
        elc.eventReason = element.empWfRequestNav.eventReason;
        elc.eventReasonDescription = await getEventReasonDescription(elc.eventReason);
        elc.subjectId = element.empWfRequestNav.subjectId;
        elc.effectiveDate = element.empWfRequestNav.effectiveDate;
        elc.empCode = element.empWfRequestNav.jobInfoNav[0]?.userId;
        elc.company = element.empWfRequestNav.jobInfoNav[0]?.company;
        salutationCode = element.empWfRequestNav.jobInfoNav[0]?.userNav?.salutation;
        elc.title = TITLE_BY_SALUTATIONION_CODE[salutationCode] || salutationCode;
        elc.fullName = element.empWfRequestNav.jobInfoNav[0]?.userNav?.defaultFullName;
        elc.email = element.empWfRequestNav.jobInfoNav[0]?.userNav?.email;
        //element.lastName = element.empWfRequestNav.jobInfoNav[0]?.userNav?.lastName;
        elc.appointmentDate = _pasrseDate(element.empWfRequestNav.jobInfoNav[0]?.employmentNav?.customDate1);
        //element.doj = element.empWfRequestNav.jobInfoNav[0]?.userNav?.hireDate;
        elc.confirmationDate = _pasrseDate(element.empWfRequestNav.jobInfoNav[0]?.probationPeriodEndDate);
        //--element.eventName = element.
        //--element.effectiveDate = element.
        //element.prbPeriod = element.empWfRequestNav.jobInfoNav[0]?.userNav?.custom10;
        //element.conStatus = element.empWfRequestNav.jobInfoNav[0]?.userNav?.custom02;
        //element.vertical = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.custom04);
        //element.function = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.custom01);
        //element.department = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.department);
        //element.division = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.division);
        //element.location = _getAttributeValue(element.empWfRequestNav.jobInfoNav[0]?.userNav?.location);
        //element.designation = element.empWfRequestNav.jobInfoNav[0]?.userNav?.custom06;
        elc.payGrade = element.empWfRequestNav.jobInfoNav[0]?.payGrade;
        elc.revisedBasic = _getRevisedBasic(element.empWfRequestNav.jobInfoNav[0]?.employmentNav?.compInfoNav[0]?.empPayCompRecurringNav);
        elc.IsManager = _determineManagerPersona(elc.company, elc.payGrade);
        elc.LetterTemplate = await _determineLetterTemplate(elc.company, elc.eventReason, elc.IsManager);
         templateMaster = await dao.getTemplateMastersById(elc.LetterTemplate);
         elc.LetterTemplateDescription = templateMaster.Description;
        elc.HREmail = await sfAPI.getBHRMail(elc.empCode);
        elc.SignGrp = _determineSigningAuthGroup(elc.company, elc.payGrade);
        elcData.push(elc);
    }    
    return elcData;
}

const _getRevisedBasic = function (empPayCompRecurringNav) {
    if (!empPayCompRecurringNav) {
        return '';
    }
    let basicSalary = '';
    empPayCompRecurringNav.forEach(element => {
        if (element.payComponent == 'Basic Salary') {
            basicSalary = element.paycompvalue;
        }
    });
    return basicSalary;
}

const getEventReasonDescription = function (oValue) {

    switch (oValue) {
        case "PRBCOM":
            return "Confirmation";
        case "PRBEXT":
            return "Probation Extension";
        case "PROMO":
            return "Promotion";
        case "PROMOWTRANS":
            return  "Promotion with transfer";
        case "TRANBU":
            return "Transfer - Vertical Change";
        case "TRANFUNC":
            return "Transfer - Function Change";
        case "TRANICOT":
            return "Inter Company Transfer";
        case "TRANDEPT":
            return "Transfer - Department Change";
        case "TRANDIV":
            return "Transfer - Division_Plant_HO Change";
        case "TRANLOC":
            return "Transfer - Location Change";
        default:
            return oValue;
    }

}

const _determineManagerPersona = function (companyCode, payGrade) {
    let isManager = false;
    switch (companyCode) {
        case 'APL':
            isManager = (payGrade.substring(0, 1) == ("F") || payGrade.substring(0, 1) == ("M") ||
                payGrade.substring(0, 3) == ("S/0") || payGrade.substring(0, 3) == ("S/1") ||
                payGrade.substring(0, 3) == ("P/0") || payGrade.substring(0, 3) == ("P/1"))
            break;
        case 'APCL':
        case 'APCO':
            isManager = (payGrade.substring(0, 4) == ("L/32") || payGrade.substring(0, 4) == ("L/33") ||
                payGrade.substring(0, 4) == ("L/34") || payGrade.substring(0, 4) == ("L/35") ||
                payGrade.substring(0, 4) == ("L/36") || payGrade.substring(0, 4) == ("L/37") ||
                payGrade.substring(0, 4) == ("L/38"))
            break;
        case 'APPG':
        case 'RIPL':
            isManager = (payGrade.substring(0, 4) == ("G/CE") || payGrade.substring(0, 4)== ("G/CO") || 
            payGrade.substring(0, 4) == ("G/GS") || payGrade.substring(0, 4) == ("G/GM") || 
            payGrade.substring(0, 4) == ("G/GA") || payGrade.substring(0, 4) == ("G/GB") || 
            payGrade.substring(0, 4) == ("G/GC") || payGrade.substring(0, 4) == ("G/2C") ||
            payGrade.substring(0, 4) == ("G/GD") || payGrade.substring(0, 4) == ("G/GE") ||
            payGrade.substring(0, 4) == ("G/EX"));
        default:
            console.info(`Inavlid CompanyCode: ${companyCode}, Allowed CompanyCodes: APL, APCL, APCO, APPG, & RIPL`);
    }

    return isManager;
}

const _determineLetterTemplate = async function (companyCode, eventReason, isManager) {
    let templates = await dao.getTemplateMasters(companyCode, eventReason);
    if (templates.length > 2) {
        console.error(`More than two Templates maintained in the TemplateMaster table for ${eventReason}.`);
    }
    if (templates.length == 2) {
        return isManager ? templates[0].TemplateCode : templates[1].TemplateCode;
    } else {
        return templates[0].TemplateCode;
    }
   // debugger;
    // if (templates.length == 2) {
    //     return isManager ? templates[0].Description : templates[1].Description;
    // } else {
    //     return templates[0].Description;
    // }

}

const _determineBHREmail = async function () {
    return 'amit.kumar.singh06@sap.com';
}

const _determineSigningAuthEmail = async function (companyCode, payGrade) {
    //let signGrp = _determineSigningAuthGroup(companyCode, payGrade);
    let signAuth = await dao.getSigningAuthority(companyCode, signGrp);
    return signAuth[0].LoginId;
}

const _determineSigningAuthGroup = function (companyCode, payGrade) {
    let signGrp = '';
    switch (companyCode) {
        case 'APL':
            if (payGrade == ("M/2A") || payGrade.substring(0, 3) == ("M/1")) {
                signGrp = 'CEO';
            } else {
                signGrp = 'CHRO';
            }
            break;
        case 'APCL':
        case 'APCO':
        case 'APPG':
        case 'RIPL':
            signGrp = 'CEO';
            break;
        default:
            console.info(`Inavlid CompanyCode: ${companyCode}, Allowed CompanyCodes: APL, APCL, APCO, APPG, & RIPL`);
    }

    return signGrp;
}

const _getAttributeValue = function (attribute) {
    if (!attribute) {
        return attribute;
    }
    let part = attribute.split('(');
    return part[0].trim();
}

const _transformToELCExclusionsMap = function(elcExclusions){
    let elcExclusionsByCompanyCodes = {};

    elcExclusions.forEach(element => {
        if(elcExclusionsByCompanyCodes[element.CompanyCode]){
            elcExclusionsByCompanyCodes[element.CompanyCode][element.PayGrade] = element.PayGrade;
        } else {
            elcExclusionsByCompanyCodes[element.CompanyCode] = {};
            elcExclusionsByCompanyCodes[element.CompanyCode][element.PayGrade] = element.PayGrade;
        }
    });

    return elcExclusionsByCompanyCodes;
}

const transformToELC = async function (elcWorkflows) {
    const asOfDate = await getCurrentDate();
    const empJobDetails = await sfAPI.getEmpJobData(elcWorkflows.empCode, asOfDate);
    const empDetails = await sfAPI.getUserData(elcWorkflows.empCode, asOfDate);
    return {
        "EmpCode": elcWorkflows.empCode,
        "CompanyCode": elcWorkflows.company,
        "LetterTemplate": elcWorkflows.LetterTemplate,
        "LetterDate": await _formatEffectiveDate(new Date()),
        "Title": elcWorkflows.title,
        "FullName": elcWorkflows.fullName,
        "NewFunction": _getAttributeValue(empDetails.custom01),
        "NewLocation": _getAttributeValue(empDetails.location),
        "appointment_letter_date": await _formatEffectiveDate(elcWorkflows.appointmentDate),
        "probation_period": empDetails.custom10,
        "confirmation_date": await _formatEffectiveDate(elcWorkflows.confirmationDate),
        "cal_probation_period": _calculateProbationPeriod(empDetails.custom10),
        "cal_effective_date": await _formatEffectiveDate(_calculateEffectiveDate(empDetails.custom10, elcWorkflows.effectiveDate)),
        "effective_date": await _formatEffectiveDate(elcWorkflows.effectiveDate),
        "new_paygrade": empJobDetails.payGrade,
        "new_designation": empDetails.custom06,
        "revised_basic": elcWorkflows.revisedBasic,
        "new_vertical": _getAttributeValue(empDetails.custom04),
        "new_department": _getAttributeValue(empDetails.department),
        //"SigningAuthorityEmail": elcWorkflows.SigningAuthEmail
        "SignGrp": elcWorkflows.SignGrp
    };
}

const updateCommunicationStatus = async function (sendStatus, elcWorkflow, tx) {
    let elcData;
    let whereCondition = { wfRequestId: elcWorkflow.wfRequestId };
    
    if (!!sendStatus.isMailSent) {
        elcData = {
            CommunicationStatus: 'SENT',
            MailResponse: JSON.stringify(sendStatus.mailServerResponse)
        }
    } else {
        elcData = {
            MailResponse: JSON.stringify(sendStatus.mailServerResponse)
        }
    }
    await dao.updateELCWorkflow(elcData, whereCondition, tx);
}

const prepareMailAttachments = async function (fileName, fileContent) {
    return [{
        filename: fileName,
        content: fileContent,
        encoding: 'base64'
    }]
}

const updateFileNetUploadStatus = async function (uploadStatus, elcWorkflow, tx) {
    let elcData = {
        IsFileNetUploaded: uploadStatus.isUploaded,
        FileNetResponse: uploadStatus.isUploaded ? '' : JSON.stringify(uploadStatus.apiResponse)
    };
    let whereCondition = { wfRequestId: elcWorkflow.wfRequestId };

    await dao.updateELCWorkflow(elcData, whereCondition, tx);
}

const updateEPUploadStatus = async function (uploadStatus, elcWorkflow, tx) {
    let elcData = {
        IsEPUploaded: uploadStatus.isUploaded,
        EPResponse: uploadStatus.isUploaded ? '' : JSON.stringify(uploadStatus.apiResponse)
    };
    let whereCondition = { wfRequestId: elcWorkflow.wfRequestId };
    
    await dao.updateELCWorkflow(elcData, whereCondition, tx);
}

const getELCFileName = async function (eventReason, empCode) {
    return `${EVENT_TYPE[eventReason]}_${empCode}_${await _getFormattedCurrentDate()}.pdf`;
}

const getCurrentDate = async function () {
    var endDate = new Date();
    return `${endDate.toISOString().split('T')[0]}`;
}

const calculateStartEffectiveDate = async function () {
    var startDate = new Date();
    let days = process.env.MonitorDisplayDays || 30;
    var day = startDate.getTime() - (days * 24 * 60 * 60 * 1000);
    startDate.setTime(day);
    return `${startDate.toISOString().split('T')[0]}`;
}

async function _getFormattedCurrentDate() {
    const d = new Date();
    let month = global.MONTHS[d.getMonth()];
    return d.getDate() + '-' + month + "-" + d.getFullYear();
}

async function _formatEffectiveDate(effectiveDate) {
    try {
        const d = new Date(effectiveDate);
        let month = global.FULL_MONTHS[d.getMonth()];
        return `${month} ${d.getDate()}, ${d.getFullYear()}`;
    } catch (error) {
        console.log(error);
        return effectiveDate;
    }
}

const _pasrseDate = function (dateStr) {
    try {
        let dateStrParts = dateStr.split(/\(|\)/);
        return new Date(Number(dateStrParts[1])).toISOString();
    } catch (error) {
        console.log(error);
        return dateStr;
    }
}

const _calculateProbationPeriod = function (probationPeriod) {
    try {
        if (probationPeriod == "NA") {
            return probationPeriod;
        }
        let num_probation_period = probationPeriod.substring(0, probationPeriod.length - 7);
        return parseInt(num_probation_period) - 3 + " months";
    } catch (error) {
        console.log(error);
        return '';
    }
}

const _calculateEffectiveDate = function (probationPeriod, effectiveDate) {
    try {
        if (probationPeriod == "NA") {
            return '';
        }
        const d = new Date(effectiveDate);
        d.setMonth(d.getMonth() + 3);
        let month = global.MONTHS[d.getMonth()];
        return d;
    } catch (error) {
        console.log(error);
        return '';
    }
}

module.exports = {
    readXMLPayloadTemplate,
    filterOutUndefineAndNull,
    filterOutUndefine,
    calculateStartDate,
    calculateEndDate,
    processELCData,
    transformToELC,
    updateCommunicationStatus,
    prepareMailAttachments,
    updateFileNetUploadStatus,
    updateEPUploadStatus,
    getELCFileName,
    calculateStartEffectiveDate
}