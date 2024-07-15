sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox) {
        "use strict";
        var that;
        return Controller.extend("com.asianpaints.sf.dbmaintenance.controller.DBMaintenance", {
            onInit: function () {
                that = this;
                //this.getRole();
                var oSchConfigModel = new sap.ui.model.json.JSONModel({
                    CompanyCode: "",
                    Year: "",
                    CommunicationDate: null,
                    isVisibleSave: false,
                    isVisibleEditSave: false,
                });
                this.getView().setModel(oSchConfigModel, "oSchConfigModel");
            },
            onAfterRendering: function () {
                var sPath = this.getView().getModel().sServiceUrl.split("/v2")[0];
                this.byId("idLinkCompAdd").setHref(sPath + "/excelTemplate/Company_Address_Template.csv");
                this.byId("idLinkSignAuth").setHref(sPath + "/excelTemplate/Sign_Authority_Template.csv");
            },
            getRole: function () {
                var oRoleModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(oRoleModel, "oModel");
                var oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/getUserRole", {
                    method: "GET",
                    success: function (oData) {       
                        this.getView().getModel("oModel").setData(oData);      
                    }.bind(this),
                    error: function (oError) {
                    }.bind(this)
                });
            },
            onBeforeRebindTable: function (oEvent) {
                var oRole = this.getView().getModel("oModel").getData();
                var oBindingParams = oEvent.getParameter("bindingParams");
                if (oRole.results.length > 0) {
                    for (var i = 0; i < oRole.results.length; i++) {
                        oBindingParams.filters.push(new sap.ui.model.Filter("CompanyCode", "EQ", oRole.results[i].CompCode));
                    }
                } else {
                    oBindingParams.filters.push(new sap.ui.model.Filter("CompanyCode", "EQ", ""));
                }
            },
            onPressUpload: function (oEvent) {
                var that = this;
                var sKey = oEvent.getSource().getParent().getParent().getParent().getParent().getSelectedKey();
                var oExcelFile = oEvent.getParameter("files")[0];
                if (oExcelFile && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (oEvent) {
                        var data = oEvent.target.result.split("\r\n");
                        data.shift();
                        var obj = {};
                        var oModel = that.getOwnerComponent().getModel();
                        var oRole = that.getView().getModel("oModel").getData().results;
                        oModel.setDeferredGroups(["batchAction"]);
                        if (sKey === "Comp Users") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.Year = parseData[1];
                                            obj.ESGrp = parseData[2];
                                            obj.Role = parseData[3];
                                            obj.LoginId = parseData[4];
                                            obj.Name = parseData[5];
                                            var oPath = "/CompUsers(CompanyCode='" + obj.CompanyCode + "',Year='" + obj.Year + "',ESGrp='" + obj.ESGrp + "',Role='" + obj.Role + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Employee Group") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.Year = parseData[1];
                                            obj.Division = parseData[2];
                                            obj.Vertical = parseData[3];
                                            obj.EE = parseData[4];
                                            obj.ES = parseData[5];
                                            obj.ESGrp = parseData[6];
                                            var oPath = "/CompEmpGroup(CompanyCode='" + obj.CompanyCode + "',Year='" + obj.Year + "',Division='" + obj.Division + "',Vertical='" + obj.Vertical + "',EE='" + obj.EE + "',ES='" + obj.ES + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Rating") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.Year = parseData[1];
                                            obj.Rating = parseData[2];
                                            //var oPath = "/CompRating(CompanyCode='" + obj.CompanyCode + "',Year='" + obj.Year + "',Rating='" + obj.Rating + "')";
                                            oModel.create("/CompRating", obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Rating Group") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.Year = parseData[1];
                                            obj.Rating = parseData[2];
                                            obj.RatingGroup = parseData[3];
                                            var oPath = "/CompRatingGroup(CompanyCode='" + obj.CompanyCode + "',Year='" + obj.Year + "',Rating='" + obj.Rating + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Signing Group") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.Year = parseData[1];
                                            obj.ESGrp = parseData[2];
                                            obj.RTGrp = parseData[3];
                                            obj.SignGrp = parseData[4];
                                            var oPath = "/CompSigningGroup(CompanyCode='" + obj.CompanyCode + "',Year='" + obj.Year + "',ESGrp='" + obj.ESGrp + "',RTGrp='" + obj.RTGrp + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Company Address") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.CompanyName = parseData[1];
                                            obj.Address1 = parseData[2];
                                            obj.Address2 = parseData[3];
                                            obj.Address3 = parseData[4];
                                            obj.Address4 = parseData[5];
                                            obj.Telephone1 = parseData[6];
                                            obj.Telephone2 = parseData[7];
                                            obj.Website = parseData[8];
                                            obj.TemplateGroup = parseData[9];
                                            obj.url = parseData[10];
                                            var oPath = "/CompanyAddress(CompanyCode='" + obj.CompanyCode + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        } else if (sKey === "Signing Authority") {
                            data.forEach(function (value) {
                                var parseData = value.split(",");
                                if (parseData && parseData[0] !== "") {
                                    for (var i = 0; i < oRole.length; i++) {
                                        if (oRole[i].CompCode === parseData[0]) {
                                            obj.CompanyCode = parseData[0];
                                            obj.SignGrp = parseData[1];
                                            obj.LoginId = parseData[2];
                                            obj.Name = parseData[3];
                                            obj.designation = parseData[4];
                                            var oPath = "/SigningAuthority(CompanyCode='" + obj.CompanyCode + "',SignGrp='" + obj.SignGrp + "')";
                                            oModel.update(oPath, obj, {
                                                groupId: "batchAction",
                                                changeSetId: "batchAction"
                                            });
                                            obj = {};
                                        }
                                    }
                                }
                            });
                        }

                        if (oRole.length > 0 && oModel.iPendingDeferredRequests > 0) {
                            oModel.submitChanges({
                                groupId: "batchAction",
                                success: function (oBatch) {
                                    MessageToast.show("Records Updated Successfully");
                                    if (sKey === "User") {
                                        that.byId("idMaintainUserTable").rebindTable();
                                    } else if (sKey === "Employee Group") {
                                        that.byId("idMaintainEmpGrpTable").rebindTable();
                                    } else if (sKey === "Rating") {
                                        that.byId("idMaintainRatingTable").rebindTable();
                                    } else if (sKey === "Rating Group") {
                                        that.byId("idMaintainRatingGrpTable").rebindTable();
                                    } else if (sKey === "Signing Group") {
                                        that.byId("idMaintainSignGrpTable").rebindTable();
                                    } else if (sKey === "Company Address") {
                                        that.byId("idMaintainCompAddrTable").rebindTable();
                                    } else if (sKey === "Signing Authority") {
                                        that.byId("idMaintainSignAuthTable").rebindTable();
                                    }
                                }.bind(this),
                                error: function (oError) {
                                    MessageToast.show("Failed");
                                }.bind(this)
                            });
                        } else {
                            MessageBox.warning("User is not authorized");
                        }
                    };
                }
                reader.onerror = function (ex) {
                    MessageToast.show(ex);
                };
                reader.readAsBinaryString(oExcelFile);
            },

            onChangeCamera: function (oEvt) {
                var sKey = this.byId("idIconTabBarFiori2").getSelectedKey();
                if (sKey === "Company Address") {
                    var sProperty = "/Logo";
                } else {
                    sProperty = "/sign";
                }
                var oPath = oEvt.getSource().getBindingContext().getPath();
                that.baseURL = that.getView().getModel().sServiceUrl + oPath + sProperty;

                var oFileUploader = oEvt.getSource();
                var aFiles = oEvt.getParameters().files;
                var currentFile = aFiles[0];
                that.resizeAndUpload(currentFile, {
                    success: function (oEvt) {
                        oFileUploader.setValue("");
                        //Here the image is on the backend, so i call it again and set the image
                    },
                    error: function (oEvt) {
                    }
                });
            },
            resizeAndUpload: function (file, mParams) {
                var reader = new FileReader();
                reader.onerror = function (e) { }
                reader.onloadend = function () {
                    var tempImg = new Image();
                    tempImg.src = reader.result;
                    tempImg.onload = function () {
                        that.uploadFile(tempImg.src, mParams, file);
                    }
                }
                reader.readAsDataURL(file);
            },
            uploadFile: function (dataURL, mParams, file) {
                var xhr = new XMLHttpRequest();
                var BASE64_MARKER = 'data:' + file.type + ';base64,';
                var base64Index = dataURL.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
                var base64string = dataURL.split(",")[1];

                xhr.onreadystatechange = function (ev) {
                    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201 || xhr.status == 204)) {
                        mParams.success(ev);
                        MessageToast.show("Successfully Uploaded");
                    } else if (xhr.readyState == 4) {
                        mParams.error(ev);
                        MessageToast.show("Failed");
                    }
                };
                var fileName = (file.name === "image.jpeg") ? "image_" + new Date().getTime() + ".jpeg" : file.name;
                xhr.open('PUT', that.baseURL, true);
                xhr.setRequestHeader("Content-type", file.type);//"application/x-www-form-urlencoded");
                //xhr.setRequestHeader("slug",fileName);
                var data = dataURL;//base64string;
                xhr.send(data);

            },

            handleLinkPress: function (oEvent) {
                oEvent.preventDefault();
                var path = oEvent.getSource().getBindingContext().sPath;
                var sKey = that.getSelectedIconTab();
                that._download(path)
                    .then((blob) => {
                        var link = document.createElement('a');
                        link.href = blob; //url;
                        link.setAttribute('download', sKey.split("/")[1]);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },

            _download: function (item) {
                var settings = {
                    url: that.getFullDownloadPath(item),
                    method: "GET",
                    xhrFields: {
                        responseType: "text", responseEncoding: "base64"
                    }
                }
                return new Promise((resolve, reject) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            if (textStatus === "nocontent") {
                                reject(result);
                                MessageBox.warning("No image to download");
                            } else {
                                MessageToast.show("Successfully Downloaded");
                                resolve(result);
                            }
                        })
                        .fail((err) => {
                            reject(err);
                            MessageToast.show("Download Failed");
                        })
                });
            },
            getSelectedIconTab: function () {
                var sKey = this.byId("idIconTabBarFiori2").getSelectedKey();
                var sProperty;
                if (sKey === "Company Address") {
                    return sProperty = "/Logo";
                } else {
                    return sProperty = "/sign";
                }
            },
            getFullDownloadPath: function (path) {
                //var parts = path.split("/");
                var sProperty = that.getSelectedIconTab();
                var url = that.getView().getModel().sServiceUrl;
                return (url + path + sProperty);
            },
            onPressSyncSF: function () {
                if (!this.oApproveDialog) {
                    this.oApproveDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Confirm",
                        state: sap.ui.core.ValueState.Warning,
                        content: new sap.m.Text({ text: "This action will refresh Employee data from SuccessFactors. This process may take upto 5 minutes! \n\n Are you sure to continue?" }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Confirm",
                            press: function () {
                                this.oApproveDialog.close();
                                this.onSyncSuccessFactor();
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oApproveDialog.open();
            },

            onSyncSuccessFactor: function () {
                this.getView().setBusy(true);
                var oModel = that.getOwnerComponent().getModel();
                oModel.read("/SFSF_User", {
                    success: function (oSuccess) {
                        this.getView().setBusy(false);
                        MessageBox.success("Employee Data Successfully Refreshed");
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }
                });
            },

            onChangeConfigSchCompCode: function (oEvent) {
                this.sCompCode = oEvent.getSource().getSelectedKey();
                this.sCurrentYear = new Date().getFullYear();
                var oModel = this.getOwnerComponent().getModel(),
                    oFilter = [];
                oFilter.push(new sap.ui.model.Filter("CompanyCode", "EQ", this.sCompCode));
                oFilter.push(new sap.ui.model.Filter("Year", "EQ", this.sCurrentYear));
                this.getView().setBusy(true);
                oModel.read("/CompSchedulerConfig", {
                    filters: oFilter,
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var oModel = this.getView().getModel("oSchConfigModel");
                        if (oData.results.length > 0 && this.sCompCode === oData.results[0].CompanyCode) {
                            oModel.setProperty("/CompanyCode", oData.results[0].CompanyCode);
                            oModel.setProperty("/Year", oData.results[0].Year);
                            //oModel.setProperty("/CommunicationDate", sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: 'dd/MM/yyyy h:mm:ss a', UTC: "true" }).format(oData.results[0].CommunicationDate));
                            oModel.setProperty("/CommunicationDate", sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: 'dd/MM/yyyy h:mm:ss a' }).format(oData.results[0].CommunicationDate));
                            oModel.setProperty("/isVisibleSave", false);
                            oModel.setProperty("/isVisibleEditSave", true);
                        } else {
                            MessageBox.information("Communication date for the year " + this.sCurrentYear + " is not maintained");
                            oModel.setProperty("/CompanyCode", this.sCompCode);
                            oModel.setProperty("/Year", this.sCurrentYear);
                            oModel.setProperty("/CommunicationDate", null);
                            oModel.setProperty("/isVisibleSave", true);
                            oModel.setProperty("/isVisibleEditSave", false);
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });

            },

            onSelectTab: function (oEvent) {
                if (oEvent.getParameter("selectedKey") === "Communication Date") {
                    if (this.byId("idCompCodeSelect").getItems().length === 1) {
                        this.byId("idCompCodeSelect").setSelectedItem(this.byId("idCompCodeSelect").getItems()[0]);
                        this.byId("idCompCodeSelect").fireChange();
                    }
                }
            },

            onChangeCommDate: function (oEvent) {
                oEvent.getSource().setValueState("None");
            },

            onCreateConfigScheduler: function () {
                var sCommDate = this.getView().byId("idCommDateTimePicker").getValue();
                if (!sCommDate) {
                    this.getView().byId("idCommDateTimePicker").setValueState("Error");
                    this.getView().byId("idCommDateTimePicker").setValueStateText("Enter communication date");
                    return;
                }
                var oConfigData = this.getView().getModel("oSchConfigModel").getData();
                delete oConfigData.isVisibleSave;
                delete oConfigData.isVisibleEditSave;
                oConfigData.Year = oConfigData.Year.toString();
                //oConfigData.CommunicationDate = this.formatDateToPostInResourcePath(new Date(oConfigData.CommunicationDate));
                oConfigData.CommunicationDate = new Date(oConfigData.CommunicationDate).toISOString();
                var oModel = this.getOwnerComponent().getModel();
                oModel.create("/CompSchedulerConfig", oConfigData, {
                    success: function (oSuccess) {
                        MessageToast.show("Communication date for the year " + this.sCurrentYear + " is maintained successfully");
                        var oModel = this.getView().getModel("oSchConfigModel");
                        oModel.setProperty("/isVisibleSave", false);
                        oModel.setProperty("/CommunicationDate", sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: 'dd/MM/yyyy h:mm:ss a' }).format(oSuccess.CommunicationDate));
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show("Failed");
                    }.bind(this)
                });

            },

            onUpdateConfigScheduler: function () {
                var sCommDate = this.getView().byId("idCommDateTimePicker").getValue();
                if (!sCommDate) {
                    this.getView().byId("idCommDateTimePicker").setValueState("Error");
                    this.getView().byId("idCommDateTimePicker").setValueStateText("Enter communication date");
                    return;
                }
                var oConfigData = this.getView().getModel("oSchConfigModel").getData();
                delete oConfigData.isVisibleSave;
                delete oConfigData.isVisibleEditSave;
                oConfigData.Year = oConfigData.Year.toString();
                //oConfigData.CommunicationDate = this.formatDateToPostInResourcePath(new Date(oConfigData.CommunicationDate));
                oConfigData.CommunicationDate = new Date(oConfigData.CommunicationDate).toISOString();
                var oModel = this.getOwnerComponent().getModel();

                var oPath = "/CompSchedulerConfig(CompanyCode='" + oConfigData.CompanyCode + "',Year='" + oConfigData.Year + "')";
                oModel.update(oPath, oConfigData, {
                    success: function (oSuccess) {
                        MessageToast.show("Communication date for the year " + this.sCurrentYear + " is updated successfully");
                        var oModel = this.getView().getModel("oSchConfigModel");
                        oModel.setProperty("/isVisibleSave", false);
                        oModel.setProperty("/isVisibleEditSave", true);
                        oModel.setProperty("/CommunicationDate", sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: 'dd/MM/yyyy h:mm:ss a' }).format(oSuccess.CommunicationDate));
                    }.bind(this),
                    error: function (oError) {
                        oModel.setProperty("/isVisibleSave", false);
                        oModel.setProperty("/isVisibleEditSave", true);
                        MessageToast.show("Failed");
                    }.bind(this)
                });
            },

            formatDateToPostInResourcePath: function (sDate) {
                var date, day, month, year, hour, min, sec, dateFormatToPost;
                if (!sDate.length || sDate.length === 10) {
                    date = new Date(sDate);
                    day = date.getDate();
                    day = (day < 10) ? ("0" + day) : day;
                    month = date.getMonth() + 1;
                    month = (month < 10) ? ("0" + month) : month;
                    year = date.getFullYear();
                    year = (year < 10) ? ("0" + year) : year;
                    hour = date.getHours();
                    hour = (hour < 10) ? ("0" + hour) : hour;
                    min = date.getMinutes();
                    min = (min < 10) ? ("0" + min) : min;
                    sec = date.getSeconds();
                    sec = (sec < 10) ? ("0" + sec) : sec;
                    dateFormatToPost = year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec + ".000";
                    return dateFormatToPost;

                }
            },

            onDeleteRecords: function (oEvent) {
                this.sDeletePath = oEvent.getParameter("listItem").getBindingContextPath();
                if (!this.oConfirmDeleteDialog) {
                    this.oConfirmDeleteDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Confirmation",
                        state: sap.ui.core.ValueState.Warning,
                        content: new sap.m.Text({ text: "Do you want to delete record?" }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Yes",
                            press: function () {
                                this.oConfirmDeleteDialog.close();
                                var oModel = this.getOwnerComponent().getModel();
                                this.getView().setBusy(true);
                                oModel.remove(this.sDeletePath, {
                                    success: function (oSuccess) {
                                        this.getView().setBusy(false);
                                        MessageToast.show("Successfully Deleted");
                                    }.bind(this),
                                    error: function (oError) {
                                        this.getView().setBusy(false);
                                        MessageToast.show("Failed");
                                    }.bind(this)
                                });
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "No",
                            press: function () {
                                this.oConfirmDeleteDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oConfirmDeleteDialog.open();
            }

        });
    });
