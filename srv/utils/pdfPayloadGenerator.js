const utils = require("./utils");
const dao = require("./dao");

async function generateBonafidePayload(contextData) {
    if (contextData) {
        var paragraphs = await dao.getTemplateParagraphs(contextData.LetterTemplate);

        let XMLData = await utils.readXMLPayloadTemplate('./srv/PDFTemplatePayload/BonafidePayload.xml');

        XMLData = await _prepareCompanyAddressData(contextData.CompanyCode, XMLData);

        XMLData = XMLData.replaceAll("{RefNo}", await utils.filterOutUndefineAndNull(contextData.EmpCode));
        XMLData = XMLData.replaceAll("{LetterDate}", await utils.filterOutUndefineAndNull(contextData.LetterDate));

        XMLData = XMLData.replace("{P1}", await utils.filterOutUndefineAndNull(paragraphs[0]?.Text));
        XMLData = XMLData.replace("{Content}", await utils.filterOutUndefineAndNull(contextData.Content));

        XMLData = await _prepareParagraphVariableData(contextData, XMLData);
        XMLData = await _prepareSigningAuthData(contextData, XMLData);

        return base64XMLData = Buffer.from(XMLData, "utf8").toString("base64");
    } else {
        return false;
    }
}

async function generateCTCPayload(contextData) {
    if (contextData) {
        var paragraphs = await dao.getTemplateParagraphs(contextData.LetterTemplate);

        let XMLData = await utils.readXMLPayloadTemplate('./srv/PDFTemplatePayload/CTCPayload.xml');

        XMLData = await _prepareCompanyAddressData(contextData.CompanyCode, XMLData);

        XMLData = XMLData.replaceAll("{RefNo}", await utils.filterOutUndefineAndNull(contextData.EmpCode));
        XMLData = XMLData.replaceAll("{LetterDate}", await utils.filterOutUndefineAndNull(contextData.LetterDate));

        XMLData = XMLData.replace("{P1}", await utils.filterOutUndefineAndNull(paragraphs[0]?.Text));
        XMLData = XMLData.replace("{Content}", await utils.filterOutUndefineAndNull(contextData.Content));

        XMLData = await _prepareParagraphVariableData(contextData, XMLData);
        XMLData = await _prepareCTCComponentsData(contextData, XMLData);
        XMLData = await _prepareSigningAuthData(contextData, XMLData);

        return base64XMLData = Buffer.from(XMLData, "utf8").toString("base64");
    } else {
        return false;
    }
}

async function generateELCPayload(elc) {
    if (elc) {

        var paragraphs = await dao.getTemplateParagraphs(elc.LetterTemplate);
        var companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
        var signingAuth = await dao.getSigningAuthority(elc.CompanyCode, elc.SignGrp);

        let XMLData = await utils.readXMLPayloadTemplate('/home/vcap/app/PDFTemplatePayload/ELCPayload.xml');

        XMLData = XMLData.replaceAll("{CompanyName}", await utils.filterOutUndefineAndNull(companyAddress[0]?.CompanyName));
        XMLData = XMLData.replaceAll("{Address1}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address1));
        XMLData = XMLData.replaceAll("{Address2}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address2));
        XMLData = XMLData.replaceAll("{Address3}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address3));
        XMLData = XMLData.replaceAll("{Address4}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address4));
        XMLData = XMLData.replaceAll("{Telephone1}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Telephone1));
        XMLData = XMLData.replaceAll("{Telephone2}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Telephone2));
        XMLData = XMLData.replaceAll("{Website}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Website));
        if (companyAddress[0]?.Logo) {
            var base64Logo = new Buffer.from(companyAddress[0]?.Logo, 'binary').toString();
            var base64LogoString = base64Logo.split(";base64,")[1];
            XMLData = XMLData.replaceAll("{CompanyLogo}", base64LogoString);
        } else {
            XMLData = XMLData.replaceAll("{CompanyLogo}", '');
        }

        XMLData = XMLData.replaceAll("{EmployeeCode}", await utils.filterOutUndefineAndNull(elc.EmpCode));
        XMLData = XMLData.replaceAll("{LetterDate}", await utils.filterOutUndefineAndNull(elc.LetterDate));
        XMLData = XMLData.replaceAll("{TitleFullName}", await utils.filterOutUndefineAndNull(elc.Title + " " + elc.FullName));
        XMLData = XMLData.replaceAll("{NewFunction}", await utils.filterOutUndefineAndNull(elc.NewFunction));
        XMLData = XMLData.replaceAll("{NewLocation}", await utils.filterOutUndefineAndNull(elc.NewLocation));

        //`<![CDATA[${paragraphs[0]?.TEXT}]]>`;
        XMLData = XMLData.replace("{P1}", await utils.filterOutUndefine(`${paragraphs[0]?.Text}`));
        XMLData = XMLData.replace("{P2}", await utils.filterOutUndefine(`${paragraphs[1]?.Text}`));
        XMLData = XMLData.replace("{P3}", await utils.filterOutUndefine(`${paragraphs[2]?.Text}`));
        XMLData = XMLData.replace("{P4}", await utils.filterOutUndefine(`${paragraphs[3]?.Text}`));
        XMLData = XMLData.replace("{P5}", await utils.filterOutUndefine(`${paragraphs[4]?.Text}`));
        XMLData = XMLData.replace("{P6}", await utils.filterOutUndefine(`${paragraphs[5]?.Text}`));

        XMLData = XMLData.replaceAll("{new_function}", await utils.filterOutUndefineAndNull(elc.NewFunction));
        XMLData = XMLData.replaceAll("{new_location}", await utils.filterOutUndefineAndNull(elc.NewLocation));
        XMLData = XMLData.replaceAll("{appointment_letter_date}", await utils.filterOutUndefineAndNull(elc.appointment_letter_date));
        XMLData = XMLData.replaceAll("{probation_period}", await utils.filterOutUndefineAndNull(elc.probation_period));
        XMLData = XMLData.replaceAll("{confirmation_date}", await utils.filterOutUndefineAndNull(elc.confirmation_date));
        XMLData = XMLData.replaceAll("{cal_probation_period}", await utils.filterOutUndefineAndNull(elc.cal_probation_period));
        XMLData = XMLData.replaceAll("{cal_effective_date}", await utils.filterOutUndefineAndNull(elc.cal_effective_date));
        XMLData = XMLData.replaceAll("{effective_date}", await utils.filterOutUndefineAndNull(elc.effective_date));
        XMLData = XMLData.replaceAll("{new_paygrade}", await utils.filterOutUndefineAndNull(elc.new_paygrade));
        XMLData = XMLData.replaceAll("{new_designation}", await utils.filterOutUndefineAndNull(elc.new_designation));
        XMLData = XMLData.replaceAll("{revised_basic}", await utils.filterOutUndefineAndNull(elc?.revised_basic));
        XMLData = XMLData.replaceAll("{new_vertical}", await utils.filterOutUndefineAndNull(elc?.new_vertical));
        XMLData = XMLData.replaceAll("{new_department}", await utils.filterOutUndefineAndNull(elc?.new_department));

        XMLData = XMLData.replaceAll("{SigningAuthName}", await utils.filterOutUndefineAndNull(signingAuth[0]?.Name));
        XMLData = XMLData.replaceAll("{SigningAuthDesignation}", await utils.filterOutUndefineAndNull(signingAuth[0]?.designation));
        if (signingAuth[0]?.sign) {
            var base64Sign = new Buffer.from(signingAuth[0]?.sign, 'binary').toString();
            var base64string = base64Sign.split(";base64,")[1];
            XMLData = XMLData.replaceAll("{Sign}", base64string);
        } else {
            XMLData = XMLData.replaceAll("{Sign}", '');
        }

        return base64XMLData = Buffer.from(XMLData, "utf8").toString("base64");
    } else {
        return false;
    }
}

async function _prepareCompanyAddressData(companyCode, XMLData) {
    var companyAddress = await dao.getCompanyAddress(companyCode);
    XMLData = XMLData.replaceAll("{CompanyName}", await utils.filterOutUndefineAndNull(companyAddress[0]?.CompanyName));
    XMLData = XMLData.replaceAll("{Address1}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address1));
    XMLData = XMLData.replaceAll("{Address2}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address2));
    XMLData = XMLData.replaceAll("{Address3}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address3));
    XMLData = XMLData.replaceAll("{Address4}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Address4));
    XMLData = XMLData.replaceAll("{Telephone1}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Telephone1));
    XMLData = XMLData.replaceAll("{Telephone2}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Telephone2));
    XMLData = XMLData.replaceAll("{Website}", await utils.filterOutUndefineAndNull(companyAddress[0]?.Website));

    return XMLData;
}

async function _prepareParagraphVariableData(contextData, XMLData) {
    XMLData = XMLData.replaceAll("{title}", await utils.filterOutUndefineAndNull(contextData.Title));
    XMLData = XMLData.replaceAll("{fullname}", await utils.filterOutUndefineAndNull(contextData.FullName));
    XMLData = XMLData.replaceAll("{empcode}", await utils.filterOutUndefineAndNull(contextData.EmpCode));
    XMLData = XMLData.replaceAll("{date_of_joining}", await utils.filterOutUndefineAndNull(contextData.DateOfJoining));
    XMLData = XMLData.replaceAll("{firstname}", await utils.filterOutUndefineAndNull(contextData.FirstName));
    XMLData = XMLData.replaceAll("{designation}", await utils.filterOutUndefineAndNull(contextData.Designation));
    XMLData = XMLData.replaceAll("{location}", await utils.filterOutUndefineAndNull(contextData.Location));
    XMLData = XMLData.replaceAll("{division}", await utils.filterOutUndefineAndNull(contextData.Division));
    XMLData = XMLData.replaceAll("{financial_year}", await utils.filterOutUndefineAndNull(contextData?.FinancialYear));
    XMLData = XMLData.replaceAll("{Purpose}", await utils.filterOutUndefineAndNull(contextData?.IssuePurpose));

    return XMLData;
}

async function _prepareSigningAuthData(contextData, XMLData) {
    XMLData = XMLData.replaceAll("{SigningAuthName}", await utils.filterOutUndefineAndNull(contextData.SigningAuthorityName));
    XMLData = XMLData.replaceAll("{SigningAuthDesignation}", await utils.filterOutUndefineAndNull(contextData.SigningAuthorityDesignation));

    return XMLData;
}

async function _prepareCTCComponentsData(contextData, XMLData) {
    var CTCComponentRows = '';
    var counter = 0;
    for (const CTCComponent of contextData.CTCComponents) {
        counter++;
        if (contextData.CTCComponents.length == counter) {
            CTCComponent.Component = `<b>${CTCComponent.Component}</b>`
            CTCComponent.PerMonth = `<b>${CTCComponent.PerMonth}</b>`
            CTCComponent.PerAnnum = `<b>${CTCComponent.PerAnnum}</b>`
        }
        CTCComponentRows = CTCComponentRows +
            '<Row>' +
            '<Component>' + `<![CDATA[${CTCComponent.Component}]]>` + '</Component>' +
            '<PerMonth>' + `<![CDATA[${CTCComponent.PerMonth}]]>` + '</PerMonth>' +
            '<PerAnnum>' + `<![CDATA[${CTCComponent.PerAnnum}]]>` + '</PerAnnum>' +
            '</Row>';
    }
    XMLData = XMLData.replace("<CTCComponentRows></CTCComponentRows>", CTCComponentRows);

    return XMLData;
}

module.exports = {
    generateBonafidePayload,
    generateCTCPayload,
    generateELCPayload
}