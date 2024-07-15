
const getTemplateMasters = async function (companyCode, eventReason) {
    try {
        var templates = await SELECT.from`asianpaints.sf.ondemand.TemplateMaster`.where({ EventReason: eventReason, CompanyCode: companyCode }).orderBy('TemplateCode asc');
        if (templates.length == 0) {
            templates = await SELECT.from`asianpaints.sf.ondemand.TemplateMaster`.where({ EventReason: {like:`%${eventReason}%`}, CompanyCode: companyCode }).orderBy('TemplateCode asc');
            if (templates.length == 0) {
                console.error(`Letter Template is not maintained in the TemplateMaster table for ${eventReason}.`);
                throw new Error(`Letter Template is not maintained in the TemplateMaster table for ${eventReason}.`);
            }
        }
        return templates;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getTemplateMastersById = async function (templateCode) {
    try {
        var templates = await SELECT.from`asianpaints.sf.ondemand.TemplateMaster`.where({ TemplateCode: templateCode });
        if (templates.length == 0) {
            console.error(`Letter Template is not maintained in the TemplateMaster table for ${templateCode}.`);
            throw new Error(`Letter Template is not maintained in the TemplateMaster table for ${templateCode}.`);
        }
        return templates[0];
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getTemplateParagraphs = async function (letterTemplate) {
    try {
        var paragraphs = await SELECT.from`asianpaints.sf.ondemand.TemplateParagraph`.where({ TemplateCode_TemplateCode: letterTemplate }).orderBy('ParagraphNo asc');
        if (paragraphs.length == 0) {
            console.error(`${letterTemplate} is not maintained in the TemplateParagraph table.`);
            throw new Error(`${letterTemplate} is not maintained in the TemplateParagraph table.`);
        }
        return paragraphs;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getSigningAuthority = async function (companyCode, signGrp) {
    try {
        var signAuth = await SELECT.from`asianpaints.sf.ondemand.SigningAuthority`.where({ CompanyCode: companyCode, SignGrp: signGrp });
        if (signAuth.length == 0) {
            console.error(`Signing Authorization is not maintained in the SigningAuthority table for Company Code: ${companyCode} & Sign Grp: ${signGrp}.`);
            throw new Error(`Signing Authorization is not maintained in the SigningAuthority table for Company Code: ${companyCode} & Sign Grp: ${signGrp}.`);
        }
        return signAuth;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getCompanyAddress = async function (companyCode) {
    try {
        var companyAddress = await SELECT.from`asianpaints.sf.ondemand.CompanyAddress`.where({ CompanyCode: companyCode });
        if (companyAddress.length == 0) {
            console.error(`${companyCode} is not maintained in the CompanyAddress table.`);
            throw new Error(`${companyCode} is not maintained in the CompanyAddress table.`);
        }
        return companyAddress;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const persistELCData = async function (elcData) {
    try {
        if (elcData.length > 0) {
            await UPSERT.into('asianpaints.sf.ondemand.ELCWorkflow').entries(elcData);
        }
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getELCWorkflows = async function (whereCondition) {
    try {
        return await SELECT.from`asianpaints.sf.ondemand.ELCWorkflow`.where(whereCondition);
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const updateELCWorkflow = async function (elcData, whereCondition, tx) {
    try {
        if (!!tx) {
            await tx.run(UPDATE('asianpaints.sf.ondemand.ELCWorkflow').with(elcData).where(whereCondition));
        } else {
            await UPDATE('asianpaints.sf.ondemand.ELCWorkflow').with(elcData).where(whereCondition)
        }
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getELCExclusions = async function () {
    try {
        return await SELECT.from`asianpaints.sf.ondemand.ELCExclusions`;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const getELCPromoExclusions = async function () {
    try {
        return await SELECT.from`asianpaints.sf.ondemand.ELCPromoExclusions`;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

module.exports = {
    getTemplateMasters,
    getTemplateMastersById,
    getTemplateParagraphs,
    getSigningAuthority,
    getCompanyAddress,
    persistELCData,
    getELCWorkflows,
    updateELCWorkflow,
    getELCExclusions,
    getELCPromoExclusions
}