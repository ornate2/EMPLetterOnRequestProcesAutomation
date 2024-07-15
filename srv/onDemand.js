const cds = require("@sap/cds");

const pdf = require("./utils/pdfPayloadGenerator");
const adobeFormAPI = require("./apis/adobeFormAPI");
const sfAPI = require("./apis/successFactorsAPI");
const utils = require("./utils/utils");
const dao = require("./utils/dao");
const mailAPI = require("./apis/mailAPI");
const spreadSheet = require("./utils/spreadSheet");
const global = require("./utils/global");
const fileNetAPI = require("./apis/fileNetAPI");

module.exports = cds.service.impl(async function () {
    const {
        SF_ELC,
        ELCWorkflow
    } = this.entities;
    this.on('reviewBonafidePDF', reviewBonafidePDF);
    this.on('reviewCTCPDF', reviewCTCPDF);
    this.on('previewELCPDF', previewELCPDF);
    this.on('READ', SF_ELC, onReadELCDataFromSF);
    this.before('READ', ELCWorkflow, beforeELCMonitorRead);
    //this.on('getDashboardInfo', getDashboardInfo);
    this.on('sendELCReleaseNotification', sendELCReleaseNotification);
    this.on('triggerELCLettersViaScheduler', triggerELCLettersViaScheduler);
    this.on('triggerELCLettersManually', triggerELCLettersManually);
    this.on('holdELCLetter', holdELCLetter);
    this.on('holdAllELCLetters', holdAllELCLetters);
    this.on('releaseAllELCLetters', releaseAllELCLetters);
    this.on('rejectELCLetter', rejectELCLetter);
    this.on('uploadELCLettersToFileNet', uploadELCLettersToFileNet);
    this.on('uploadELCLettersToEP', uploadELCLettersToEP);
});

async function reviewBonafidePDF(req, res) {
    try {
        var bonafide = req.data.bonafide;
        var xdpTemplate = req.data.xdpTemplate;
        var base64XMLData = await pdf.generateBonafidePayload(bonafide);
        var pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplate);
        var a = [];
        a.push(pdfFile);
        return a;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function reviewCTCPDF(req, res) {
    try {
        var ctc = req.data.ctc;
        var xdpTemplate = req.data.xdpTemplate;
        var base64XMLData = await pdf.generateCTCPayload(ctc);
        var pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplate);
        var a = [];
        a.push(pdfFile);
        return a;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}


async function previewELCPDF(req, res) {
    try {
        var wfRequestId = req.data.wfRequestId;
        let elcWorkflows = await dao.getELCWorkflows({ wfRequestId: wfRequestId });
        let elc = await utils.transformToELC(elcWorkflows[0]);
        let base64XMLData = await pdf.generateELCPayload(elc);
        let companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
        let xdpTemplateName = `${global.PDF_TEMPLATE_NAME.ELCForm}${companyAddress[0].TemplateGroup}${global.PDF_TEMPLATE_NAME.ELCTemplate}${companyAddress[0].TemplateGroup}`;
        let pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplateName);
        let a = [];
        a.push(pdfFile);
        return a;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function onReadELCDataFromSF(req, res) {
    try {
        let startDate = await utils.calculateStartDate();
        let endDate = await utils.calculateEndDate();
        let wfRequestData = await sfAPI.getELCWfRequestData(startDate, endDate);
        let elc = await utils.processELCData(wfRequestData);
        await dao.persistELCData(elc);
        return elc;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function sendELCReleaseNotification(req, res) {
    try {
        let whereCondition = cds.parse.expr(`CommunicationStatus='' and effectiveDate<''`);
        whereCondition.xpr[2].val = global.COMMUNICATION_STATUS.PENDING;
        whereCondition.xpr[6].val = await utils.calculateEndDate();
        let elcWorkflows = await dao.getELCWorkflows(whereCondition);
        let HRMails = [];
        let elcWorkflowsByHRMail = {};
        for (const elcWorkflow of elcWorkflows) {
            HRMails = elcWorkflow.HREmail.split(",");
            for (const HREmail of HRMails) {
                if (!HREmail) {
                    continue;
                }
                if (elcWorkflowsByHRMail[HREmail]) {
                    (elcWorkflowsByHRMail[HREmail]).push(elcWorkflow);
                    continue;
                }
                elcWorkflowsByHRMail[HREmail] = [];
                (elcWorkflowsByHRMail[HREmail]).push(elcWorkflow);
            }
        }

        for (const HREmail in elcWorkflowsByHRMail) {
            if (HREmail) {
                let elcSheet = await spreadSheet.generateELCSpreadSheet(elcWorkflowsByHRMail[HREmail]);
                let attachments = await utils.prepareMailAttachments('ELC.xlsx', elcSheet);
                await mailAPI.sendMail(HREmail, 'ELC Excel Sheet', '<html><body>Dear Colleague,<br/><br/>Fews ELC letters have been scheduled to trigger today.<br/>Kindly refer the attached sheet for more details.<br/><br/>Click here to access:- <a href="https://asian-paints-hr-dev-b25mijs1.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=d27ce97a-fa62-4e8c-b398-bf0eb177511c#ELCMonitor-display">ELC Monitor App</a><br/><br/>- Human Resources<br/><br/></body></html>', attachments);
            }
        }

        return { status: 'Success' };
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}
async function triggerELCLettersViaScheduler(req, res) {
    try {
        let whereCondition = cds.parse.expr(`CommunicationStatus='' and effectiveDate<''`);
        whereCondition.xpr[2].val = global.COMMUNICATION_STATUS.PENDING;
        whereCondition.xpr[6].val = await utils.calculateEndDate();
        let elcWorkflows = await dao.getELCWorkflows(whereCondition);
        for (const elcWorkflow of elcWorkflows) {
            let elc = await utils.transformToELC(elcWorkflow);
            let base64XMLData = await pdf.generateELCPayload(elc);
            let companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
            let xdpTemplateName = `${global.PDF_TEMPLATE_NAME.ELCForm}${companyAddress[0].TemplateGroup}${global.PDF_TEMPLATE_NAME.ELCTemplate}${companyAddress[0].TemplateGroup}`;
            let pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplateName);
            pdfFile.fileName = await utils.getELCFileName(elcWorkflow.eventReason, elcWorkflow.empCode);
            await _triggerELCLetter(elcWorkflow, pdfFile);
            await _uploadELCLetterToEP(elcWorkflow, pdfFile);
            await _uploadELCLetterToFileNet(elcWorkflow, pdfFile);
        }
        return { status: 'Success' };
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function triggerELCLettersManually(req, res) {
    try {
        let wfRequestIds = req.data.wfRequestIds;
        for (const wfRequestId of wfRequestIds) {
            let whereCondition = cds.parse.expr(`wfRequestId='' and CommunicationStatus='' and effectiveDate<''`);
            whereCondition.xpr[2].val = wfRequestId;
            whereCondition.xpr[6].val = global.COMMUNICATION_STATUS.PENDING;
            whereCondition.xpr[10].val = await utils.calculateEndDate();
            let elcWorkflows = await dao.getELCWorkflows(whereCondition);
            if (elcWorkflows.length == 0) {
                continue;
            }
            let elc = await utils.transformToELC(elcWorkflows[0]);
            let base64XMLData = await pdf.generateELCPayload(elc);
            let companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
            let xdpTemplateName = `${global.PDF_TEMPLATE_NAME.ELCForm}${companyAddress[0].TemplateGroup}${global.PDF_TEMPLATE_NAME.ELCTemplate}${companyAddress[0].TemplateGroup}`;
            let pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplateName);
            pdfFile.fileName = await utils.getELCFileName(elcWorkflows[0].eventReason, elcWorkflows[0].empCode);
            await _triggerELCLetter(elcWorkflows[0], pdfFile);
            await _uploadELCLetterToEP(elcWorkflows[0], pdfFile);
            await _uploadELCLetterToFileNet(elcWorkflows[0], pdfFile);
        }
        return { status: 'Success' };
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function holdELCLetter(req, res) {
    try {
        let wfRequestId = req.data.wfRequestId;
        let elcWorkflows = await dao.getELCWorkflows({ wfRequestId: wfRequestId });

        let elcData = { CommunicationStatus: '' };
        let whereCondition = { wfRequestId: wfRequestId };

        if (elcWorkflows[0].CommunicationStatus != global.COMMUNICATION_STATUS.HOLD) {
            elcData.CommunicationStatus = global.COMMUNICATION_STATUS.HOLD;
        } else {
            elcData.CommunicationStatus = global.COMMUNICATION_STATUS.PENDING;
        }

        await dao.updateELCWorkflow(elcData, whereCondition);

        var a = [];
        a.push({ status: 'Success' });
        return a;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function holdAllELCLetters(req, res) {
    try {
        const elcData = { CommunicationStatus: global.COMMUNICATION_STATUS.HOLD };
        const whereCondition = {
            CommunicationStatus: global.COMMUNICATION_STATUS.PENDING,
            HREmail: req.user.id
        };
        await dao.updateELCWorkflow(elcData, whereCondition);
        return { status: 'Success' };
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function releaseAllELCLetters(req, res) {
    try {
        const elcData = { CommunicationStatus: global.COMMUNICATION_STATUS.PENDING };
        const whereCondition = {
            CommunicationStatus: global.COMMUNICATION_STATUS.HOLD,
            HREmail: req.user.id
        };
        await dao.updateELCWorkflow(elcData, whereCondition);
        return { status: 'Success' };
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function rejectELCLetter(req, res) {
    try {
        var wfRequestId = req.data.wfRequestId;
        var remarks = req.data.remarks;

        let elcData = {
            CommunicationStatus: global.COMMUNICATION_STATUS.REJECTED,
            CommunicationRemarks: remarks
        };
        let whereCondition = { wfRequestId: wfRequestId };
        await dao.updateELCWorkflow(elcData, whereCondition);

        var a = [];
        a.push({ status: 'Success' });
        return a;
    } catch (err) {
        console.log(err);
        req.error(404, err.message);
    }
}

async function uploadELCLettersToFileNet(req, res) {
    try {
        let wfRequestIds = req.data.wfRequestIds;
        let isFileUploadedForAll = true;
        let db = await cds.connect.to('db');
        for (const wfRequestId of wfRequestIds) {
            let tx = db.tx();
            var elcWorkflows = await dao.getELCWorkflows({ wfRequestId: wfRequestId });
            if (!!elcWorkflows[0].IsFileNetUploaded || elcWorkflows[0].CommunicationStatus != global.COMMUNICATION_STATUS.SENT) {
                await tx.commit();
                continue;
            }
            let elc = await utils.transformToELC(elcWorkflows[0]);
            let base64XMLData = await pdf.generateELCPayload(elc);
            let companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
            let xdpTemplateName = `${global.PDF_TEMPLATE_NAME.ELCForm}${companyAddress[0].TemplateGroup}${global.PDF_TEMPLATE_NAME.ELCTemplate}${companyAddress[0].TemplateGroup}`;
            let pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplateName);
            pdfFile.fileName = await utils.getELCFileName(elcWorkflows[0].eventReason, elcWorkflows[0].empCode);

            var payload = {
                fileName: pdfFile.fileName,
                fileContent: pdfFile.fileContent,
                empCode: elcWorkflows[0].empCode,
                companycode: elcWorkflows[0].company
            }
            //let payload = await utils.preparePayloadForFileNet();
            let uploadStatus = await fileNetAPI.uploadFileToFileNet(payload);
            await utils.updateFileNetUploadStatus(uploadStatus, elcWorkflows[0], tx);

            if (!uploadStatus.isUploaded) {
                isFileUploadedForAll = false;
            }

            await tx.commit();
        }
        if (!isFileUploadedForAll) {
            throw new Error('Some records have not synced to FileNet properly. Please check');
        }
        return { status: 'Success' };
    } catch (error) {
        console.error(`FileNet Error: `);
        console.error(error);
        req.error(500, error);
    }
}

async function uploadELCLettersToEP(req, res) {
    try {
        let wfRequestIds = req.data.wfRequestIds;
        let isFileUploadedForAll = true;
        let db = await cds.connect.to('db');
        for (const wfRequestId of wfRequestIds) {
            let tx = db.tx();
            var elcWorkflows = await dao.getELCWorkflows({ wfRequestId: wfRequestId });
            if (!!elcWorkflows[0].IsEPUploaded || elcWorkflows[0].CommunicationStatus != global.COMMUNICATION_STATUS.SENT) {
                await tx.commit();
                continue;
            }
            let elc = await utils.transformToELC(elcWorkflows[0]);
            let base64XMLData = await pdf.generateELCPayload(elc);
            let companyAddress = await dao.getCompanyAddress(elc.CompanyCode);
            let xdpTemplateName = `${global.PDF_TEMPLATE_NAME.ELCForm}${companyAddress[0].TemplateGroup}${global.PDF_TEMPLATE_NAME.ELCTemplate}${companyAddress[0].TemplateGroup}`;
            let pdfFile = await adobeFormAPI.renderPDF(base64XMLData, xdpTemplateName);
            pdfFile.fileName = await utils.getELCFileName(elcWorkflows[0].eventReason, elcWorkflows[0].empCode);

            var payload = {
                fileName: pdfFile.fileName,
                fileContent: pdfFile.fileContent,
                empCode: elcWorkflows[0].empCode
            }

            var uploadStatus = await sfAPI.uploadFileToEP(payload);
            await utils.updateEPUploadStatus(uploadStatus, elcWorkflows[0], tx);

            if (!uploadStatus.isUploaded) {
                isFileUploadedForAll = false;
            }
            await tx.commit();
        }
        if (!isFileUploadedForAll) {
            throw new Error('Some records have not synced to EP properly. Please check');
        }
        return { status: 'Success' };
    } catch (error) {
        console.error(`EP Error: `);
        console.error(error);
        req.error(500, error);
    }
}

async function beforeELCMonitorRead(req) {
    var loginIdCondition = cds.parse.expr(`HREmail like '' and effectiveDate>='' and effectiveDate<''`);
    loginIdCondition.xpr[2].val = `%${req.user.id}%`;
    loginIdCondition.xpr[6].val = await utils.calculateStartEffectiveDate();
    loginIdCondition.xpr[10].val = await utils.calculateEndDate();
    console.log(`Logged in user id: ${req.user.id}`);
    if (req.query.SELECT.where) {
        req.query.SELECT.where.push('and');
        req.query.SELECT.where.push(loginIdCondition);
    } else {
        req.query.SELECT.where = loginIdCondition.xpr;
    }
}

const _triggerELCLetter = async function (elcWorkflow, pdfFile) {
    let db = await cds.connect.to('db');
    let tx = db.tx();
    let attachments = await utils.prepareMailAttachments(pdfFile.fileName, pdfFile.fileContent);
    let templateMaster = await dao.getTemplateMastersById(elcWorkflow.LetterTemplate);
    let sendStatus = await mailAPI.sendMail(elcWorkflow.email, templateMaster.MailSubject, templateMaster.MailBody, attachments);
    await utils.updateCommunicationStatus(sendStatus, elcWorkflow, tx);
    await tx.commit();
}

const _uploadELCLetterToEP = async function (elcWorkflow, pdfFile) {
    let db = await cds.connect.to('db');
    let tx = db.tx();
    var payload = {
        fileName: pdfFile.fileName,
        fileContent: pdfFile.fileContent,
        empCode: elcWorkflow.empCode
    }
    var uploadStatus = await sfAPI.uploadFileToEP(payload);
    await utils.updateEPUploadStatus(uploadStatus, elcWorkflow, tx);
    await tx.commit();
}

const _uploadELCLetterToFileNet = async function (elcWorkflow, pdfFile) {
    let db = await cds.connect.to('db');
    let tx = db.tx();
    var payload = {
        fileName: pdfFile.fileName,
        fileContent: pdfFile.fileContent,
        empCode: elcWorkflow.empCode,
        companycode: elcWorkflow.company
    }
    let uploadStatus = await fileNetAPI.uploadFileToFileNet(payload);
    await utils.updateFileNetUploadStatus(uploadStatus, elcWorkflow, tx);
    await tx.commit();
}