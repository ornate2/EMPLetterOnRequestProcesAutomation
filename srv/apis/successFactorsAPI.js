const SapCfAxios = require('sap-cf-axios').default;

const BATCH_SIZE = 1000;
const getELCWfRequestData = async function (startDate, endDate) {
    try {
        const ELC = await cds.connect.to('ECWorkflow');
        const { WfRequest } = ELC.entities;
        var whereClouse = cds.parse.expr(`status='COMPLETED' and module='HRIS' and lastModifiedOn>='' and lastModifiedOn<''`);
        whereClouse.xpr[10].val = startDate;
        whereClouse.xpr[14].val = endDate;
        let elcData = [];
        let result;
        let skip = 0;
        do {
            result = await _fetchWfRequestData(ELC, WfRequest, whereClouse, skip);
            elcData.push(...result);
            skip = skip + BATCH_SIZE;
        } while (result.length == BATCH_SIZE);
        return elcData;
    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }
}

const _fetchWfRequestData = async function (ELC, WfRequest, whereClouse, skip) {
    return await ELC.run(SELECT.from(WfRequest, wfReq => {
            wfReq('wfRequestId'), wfReq('lastModifiedOn'),
            wfReq.empWfRequestNav(empWfReq => {
                empWfReq('empWfRequestId'), empWfReq('eventReason'), empWfReq('subjectId'), empWfReq('effectiveDate'),
                empWfReq.jobInfoNav(jobInfo => {
                    jobInfo('userId'), jobInfo('company'), jobInfo('payGrade'), jobInfo('probationPeriodEndDate'),
                    jobInfo.userNav(user => {
                        user('salutation'), user('defaultFullName'), user('email'), user('division')/*, user('lastName'), 
                        user('hireDate'), user('custom10'), user('custom02'), 
                        user('custom04'), user('custom01'), user('department'), 
                        user('division'), user('location'), user('custom06')*/
                    }),
                    jobInfo.employmentNav(employment => {
                        employment('customDate1')
                        employment.compInfoNav(compInfo => {
                            //compInfo(''),
                            compInfo.empPayCompRecurringNav(empPayCompRecurring => {
                                empPayCompRecurring('payComponent'), empPayCompRecurring('paycompvalue')
                            })
                        })
                    })
                })
            })
    }).where(whereClouse).limit(BATCH_SIZE, skip));
}

async function uploadFileToEP(payload) {
    try {
        var SFDestinationName = process.env.SFUpdateDestination || 'SF_Update';
        const cfAxios = SapCfAxios(SFDestinationName);
        const response = await cfAxios({
            method: 'POST',
            url: 'upsert',
            data: [
                {
                    "__metadata": {
                        "uri": "Attachment"
                    },
                    "documentCategory": "BACKGROUND_DOCUMENTS",
                    "documentEntityType": "BACKGROUND",
                    "module": "EMPLOYEE_PROFILE",
                    "moduleCategory": "HRIS_ATTACHMENT",
                    "viewable": true,
                    "userId": payload.empCode,
                    "fileName": payload.fileName,
                    "fileContent": payload.fileContent
                }
            ],
            headers: {
                "content-type": "application/json"
            }
        });
        var attachmentId = await _parseAttachmentId(response.data);
        if (!attachmentId) {
            return {
                isUploaded: false,
                apiResponse: response?.data
            };
        }
        console.info(`Successfully uploaded to Employee Profile for ${payload.empCode}`);
        var payloadData = {
            fileName: payload.fileName,
            empCode: payload.empCode,
            attachmentId: attachmentId
        }
        return await _attachFileToEP(payloadData);
    } catch (err) {
        console.error(`Error while uploading to Employee Profile for ${payload.empCode}`);
        return {
            isUploaded: false,
            apiResponse: err?.message
        };
    }

}

const _attachFileToEP = async function (payload) {
    try {
        const SFDestinationName = process.env.SFUpdateDestination || 'SF_Update';
        const cfAxios = SapCfAxios(SFDestinationName);
        const response = await cfAxios({
            method: 'POST',
            url: 'upsert',
            data: [
                { 
                    "__metadata": { "uri": "Background_Documents" }, 
                    "userId": payload.empCode,
                    "DocName": payload.fileName, 
                    "attachment": payload.attachmentId,
                    "startDate": `/Date(${new Date().getTime()})/`
                }
            ],
            headers: {
                "content-type": "application/json"
            }
        });
        if (response.data.d[0].httpCode != 200) {
            return {
                isUploaded: false,
                apiResponse: response?.data
            };
        }
        console.info(`Successfully attached to Employee Profile for ${payload.empCode}`);
        return {
            isUploaded: true,
            apiResponse: response?.data
        };
    } catch (err) {
        console.error(`Error while attaching to Employee Profile for ${payload.empCode}`);
        return {
            isUploaded: false,
            apiResponse: err?.message
        };
    }
}

async function _parseAttachmentId(responseData) {
    try {
        var splitResult = responseData.d[0].key.split("=");
        return splitResult[1];
    } catch (err) {
        return null;
    }
}

async function getUserData(userId, asOfDate) {
    try {
        const axios = SapCfAxios("SF");
        const response = await axios({
            method: 'GET',
            url: `/User(${userId})?$format=json&asOfDate=${asOfDate}`,
            dataType: "json"
        });
        return response.data.d;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function getEmpJobData(userId, asOfDate) {
    try {
        const axios = SapCfAxios("SF");
        const response = await axios({
            method: 'GET',
            url: `/EmpJob?$filter=userId eq '${userId}'&asOfDate=${asOfDate}&$format=json`,
            dataType: "json"
        });
        return response.data.d.results[0];
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function getBHRMail(empCode) {
    //var email = req.data.empEmail;
    let email = 'aadharsh.m@asianpaints.com'
    //empCode = '111560';
    try {
        const axios = SapCfAxios("SF");
        const emailResponse = await axios({
            method: 'GET',
            url: "/PerEmail/?$format=json&$filter=emailAddress eq '" + email + "'",
            dataType: "json"
        });
        const empResponse = await axios({
            method: 'GET',
            url: "/User(" + empCode + ")/?$format=json",
            dataType: "json"
        });
        const empDetails = {};
        const userOrgData = {};
        userOrgData.company = getCode(empResponse.data.d.custom08);
        userOrgData.businessUnit = getCode(empResponse.data.d.custom04);
        userOrgData.division = getCode(empResponse.data.d.division);
        userOrgData.location = getCode(empResponse.data.d.location);
        var payGrade = "";
        if (empResponse.data.d.custom03 != null) {
            if (userOrgData.company == 'APCL' || userOrgData.company == 'APCO') {
                payGrade = empResponse.data.d.custom03;
            } else {
                if (empResponse.data.d.custom03 == 'TECH.OFFR/CHEMISTS/SR SUPERVISOR (PTH) (C/PE)') {
                    payGrade = 'C/PE';
                } else if (empResponse.data.d.custom03 == 'TECH.OFFR/CHEMISTS/SUPERVISOR (PTH) (C/PS)') {
                    grade = 'C/PS';
                } else {
                    if ((empResponse.data.d.custom03).search("\\(") > 0) {
                        var part1 = (empResponse.data.d.custom03).split("(");
                            var part2 = part1[1].split(")");
                            payGrade = part2[0].trim();
                            console.log("4" + payGrade);
                    }
                }
            }
        }
        userOrgData.payGrade = payGrade;
        console.log("User Response: ", empResponse.data.d.displayName);
        empDetails.EmpCode = empCode;
        if (userOrgData.company == 'APCL' || userOrgData.company == 'APCO') {
            return await getBHRDetails({ resolverId: '7531L' });
        }
        var BHRemail = await BHRResolver(userOrgData);
        var BHRDetails;
        if (BHRemail.resolverType == 'DYNAMIC_GROUP') {
            BHRDetails = await getBHRDetails(BHRemail);
            if (!BHRDetails) {
                BHRDetails = await getBHRDetails({ resolverId: '7530L' });
            }
        } else if (BHRemail.resolverType == 'PERSON') {
            BHRDetails = await getBHRDetails({ resolverId: '7530L' });
        } else {
            BHRDetails = await getBHRDetails({ resolverId: '7530L' });
        }
        
        return BHRDetails;
    }
    catch (Error) {
        console.log("Error", Error);
        return;
    }
}

async function BHRResolver(userOrgData) {
    let found = false;
    var resolver = {
        resolverType: "",
        resolverId: ""
    }
    let userOrg = {
        "company": userOrgData.company,
        "businessUnit": userOrgData.businessUnit,
        "division": userOrgData.division,
        "location": userOrgData.location,
        "payGrade": userOrgData.payGrade
    };
    console.log("userOrg:" + JSON.stringify(userOrg));
    const axios = SapCfAxios("SF");
    const foDynamicRole = await axios({
        method: 'GET',
         url: "/FODynamicRole?$expand=dynamicGroupNav&$select=company,businessUnit,division,location,payGrade,dynamicRoleAssignmentId,externalCode,name,resolverType,person,dynamicGroupNav/groupID,dynamicGroupNav/groupName,dynamicGroupNav/groupType&$filter=externalCode eq 'ELC_HR APPR'&$orderby=dynamicRoleAssignmentId&$format=json",
         dataType: "json"
     });
   console.log(foDynamicRole.data.d.results.length);
   for (let i = 0; i < foDynamicRole.data.d.results.length && found == false; i++) {
        let currFODRole = foDynamicRole.data.d.results[i];
        let match = false;
        console.log("foDynamicRole: " + i + "-->" + JSON.stringify(foDynamicRole.data.d.results[i]));
        if (currFODRole.company && userOrg.company == currFODRole.company) {
            if (currFODRole.businessUnit && userOrg.businessUnit == currFODRole.businessUnit) {
                if (currFODRole.division && userOrg.division == currFODRole.division) {
                    if (currFODRole.location && userOrg.location == currFODRole.location) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company. Business Uint, Division, Location, Paygrade matches");
                            match = true;
                        } else if (currFODRole.payGrade == null) {
                            console.log("Company. Business Uint, Division, Location matches Paygrade null");
                            match = true;
                        }
                    } else if (currFODRole.location == null) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            match = true;
                            console.log("Company. Business Uint, Division,Paygrade matches Location null");
                        }
                        else if (currFODRole.payGrade == null) {
                            console.log("Company. Business Uint, Division matches Location,Paygrade null");
                            match = true;
                        }
                    }
                }
                else if (currFODRole.division == null) {
                    if (currFODRole.location && userOrg.location == currFODRole.location) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company. Business Uint, Location, Paygrade  matches Division  null");
                            match = true;
                        } else if (currFODRole.payGrade == null) {
                            console.log("Company. Business Uint, Location  matches Division, Paygrade  null");
                            match = true;
                        }
                    } else if (currFODRole.location == null) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company. Business Uint, Paygrade  matches Division, Location  null");
                            match = true;
                        }
                        else if (currFODRole.payGrade == null) {
                            console.log("Company. Business Uint matches Division, Location, Paygrade   null");
                            match = true;
                        }
                    }
                }
            } else if (currFODRole.businessUnit == null) {
                if (currFODRole.division && userOrg.division == currFODRole.division) {
                    if (currFODRole.location && userOrg.location == currFODRole.location) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company. Division, Location, Paygrade matches Business Uint null");
                            match = true;
                        } else if (currFODRole.payGrade == null) {
                            console.log("Company. Division, Location matches Business Uint, Paygrade null");
                            match = true;
                        }
                    } else if (currFODRole.location == null) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company. Division, Paygrade matches Business Uint, Location null");
                            match = true;
                        }
                        else if (currFODRole.payGrade == null) {
                            console.log("Company. Division matches Business Uint, Location, Paygrade null");
                            match = true;
                        }
                    }
                } else if (currFODRole.division == null) {
                    if (currFODRole.location && userOrg.location == currFODRole.location) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company, location, Paygrade matches Business Uint, Division null");
                            match = true;
                        } else if (currFODRole.payGrade == null) {
                            console.log("Company, location matches Business Uint, Division, Paygrade  null");
                            match = true;
                        }
                    } else if (currFODRole.location == null) {
                        if (currFODRole.payGrade && userOrg.payGrade == currFODRole.payGrade) {
                            console.log("Company, Paygrade matches Business Uint, Division, location null");
                            match = true;
                        }
                        else if (currFODRole.payGrade == null) {
                            console.log("Company matches Business Uint, Division, location, Paygrade null");
                            match = true;
                        }
                    }
                }
            }
        }
        if (match) {
            resolver.resolverType = currFODRole.resolverType;
            if (resolver.resolverType == "DYNAMIC_GROUP") {
                resolver.resolverId = resolver.resolverId.concat(currFODRole.dynamicGroupNav.groupID, "L");
                console.log("dynamic group resolver ID" + resolver.resolverId);
                found = true;
            } else if (resolver.resolverType == "PERSON") {
                resolver.resolverId = currFODRole.person;
                console.log("Resolver person resolver ID" + resolver.resolverId);
                found = true;
                break;
            }
        }
    }
    console.log("BHR Resolver:" + resolver.resolverId);
    return resolver;
}

async function getBHRDetails(BHRemail){
    const axios = SapCfAxios("SF");
    const users = await axios({
        method: 'GET',
         url: `/getUsersByDynamicGroup?groupId=${BHRemail.resolverId}&$format=json`,
         dataType: "json"
     });

     let userDetails = [];
     for (const user of users.data.d) {
        const userAPIResponse = await getUserDetails(user.userId);
        if (userAPIResponse.data.d.custom03) {
            let payGrade = userAPIResponse.data.d.custom03;
            let payGradeId;
            if (payGrade == ("TECH.OFFR/CHEMISTS/SR SUPERVISOR (PTH) (C/PE)"))
                payGradeId = "C/PE";
            else if (payGrade == ("TECH.OFFR/CHEMISTS/SUPERVISOR (PTH) (C/PS)"))
                payGradeId = "C/PS";
            else {
                if ((payGrade).search("\\(") > 0) {
                    var part1 = (payGrade).split("(");
                    var part2 = part1[1].split(")");
                    payGradeId = part2[0].trim();
                }
            }
    
            if (!(payGradeId.substring(0, 1) == ("M"))
                && !(payGradeId.substring(0, 1) == ("F"))
                && !(payGradeId.substring(0, 1) == ("K"))
                && !(payGradeId.substring(0, 3) == ("S/0"))
                && !(payGradeId.substring(0, 3) == ("S/1"))
                && !(payGradeId.substring(0, 3) == ("P/0"))
                && !(payGradeId.substring(0, 3) == ("P/1"))) {
    
                userDetails.push(userAPIResponse.data.d.email);
            }
        }
    }
    return userDetails.toString();
}

async function getUserDetails(userId) {
    const axios = SapCfAxios("SF");
    const userAPIResponse = await axios({
        method: 'GET',
        url: `/User(${userId})?$format=json`,
        dataType: "json"
    });

    return userAPIResponse;
}

function getCode(str) {
    if (str != null && str.search("\\(") > 0) {
        var sArray = str.split("(");
        sArray = sArray[1].split(")");
        return sArray[0];
    }
}

module.exports = {
    getELCWfRequestData,
    uploadFileToEP,
    getBHRMail,
    getUserData,
    getEmpJobData
}
