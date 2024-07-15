sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Label",
    "sap/m/TextArea",
    "sap/m/Button",
    "sap/ui/core/Core",
    "../model/globalFilter",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "../model/maps",
    "sap/ui/export/Spreadsheet",
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BusyIndicator, MessageBox, MessageToast, Dialog, mobileLibrary, Label, TextArea, Button, Core, globalFilter, JSONModel, formatter, maps, Spreadsheet, PDFViewer, URLWhitelist) {
        "use strict";

        var DialogType = mobileLibrary.DialogType;
        var ButtonType = mobileLibrary.ButtonType;

        return Controller.extend("com.asianpaints.sf.elcmonitor.controller.ELCMonitor", {
            formatter: formatter,
            onInit: function () {
                var tabCountModel = new JSONModel();
                this.getView().setModel(tabCountModel, "tabCountModel");
            },



            onRefresh: function () {
                this.getView().getModel().refresh();
            },

            onTriggerLetter: function () {
                BusyIndicator.show();
                var oELCTable = this.byId("idELCMonitorTable");
                var aIndices = oELCTable.getSelectedIndices();
                var aWFRequestIds = [];
                var wfRequestId = "";
                var oAtleastOneSentSelected = "";
                var oAtleastOnePendingSelected = "";
                for (const index of aIndices) {
                    wfRequestId = oELCTable.getContextByIndex(index).getProperty('wfRequestId');
                    if (oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("HOLD").toLowerCase()) //Naveen code change
                    {
                        BusyIndicator.hide();
                        MessageBox.error("Letter is on Hold, Cannot send Compensation letter");
                        return;
                    }
                    if (oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("REJECTED").toLowerCase()) //Naveen code change
                    {
                        BusyIndicator.hide();
                        MessageBox.error("Letter is on Rejected, Cannot send Compensation letter");
                        return;
                    }
                    if (oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("SENT").toLowerCase()) {
                        var oAtleastOneSentSelected = 'X';
                    }

                    if (oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("PENDING").toLowerCase()) {
                        var oAtleastOnePendingSelected = 'X';
                    }

                    aWFRequestIds.push(wfRequestId);
                }
                if (aWFRequestIds.length == 0) {
                    BusyIndicator.hide();
                    MessageBox.information('Please select atleast one Employee to intiate the process.');
                    return;
                }
                MessageToast.show('Selected Employees ELC letters will be triggered excluding for "SENT/HOLD/REJECTED" status!');

                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/triggerELCLettersManually(...)");

                oOperation.setParameter("wfRequestIds", aWFRequestIds).execute().then(function () {
                    oELCTable.clearSelection();
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();

                    // MessageBox.success('ELC letters sent successfully.');
                    // Begin of add by I589796 on 06/23/2023
                    if (oAtleastOneSentSelected == 'X' && oAtleastOnePendingSelected == 'X') {
                        MessageBox.success("Letters to selected employee(s) have already been triggered from the system. Only letters which are pending will be sent now.")
                    } else if (oAtleastOneSentSelected == 'X' && oAtleastOnePendingSelected == '') {
                        MessageBox.success("Letters to selected employee(s) have already been triggered from the system");
                    } else if (oAtleastOneSentSelected == '' && oAtleastOnePendingSelected == 'X') {
                        MessageBox.success('ELC letters sent successfully');
                    }
                    // End of add by I589796 on 06/23/2023

                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },

            onFileNetUpload: function () {
                this._fileUpload('uploadELCLettersToFileNet');
            },

            onEPUpload: function () {
                this._fileUpload('uploadELCLettersToEP');
            },

            _fileUpload: function (sFunctionName) {
                BusyIndicator.show();
                var oELCTable = this.byId("idELCMonitorTable");
                var aIndices = oELCTable.getSelectedIndices();
                var aWFRequestIds = [];
                var wfRequestId = "";
                for (const index of aIndices) {
                    wfRequestId = oELCTable.getContextByIndex(index).getProperty('wfRequestId');
                    if (aIndices.length == 1 && oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("HOLD").toLowerCase()) //Naveen code change
                    {
                        BusyIndicator.hide();
                        MessageBox.error("Letter is on Hold, Cannot upload ELC letter");
                        return;
                    }
                    if (aIndices.length == 1 && oELCTable.getContextByIndex(index).getProperty('CommunicationStatus').toLowerCase() === ("REJECTED").toLowerCase()) //Naveen code change
                    {
                        BusyIndicator.hide();
                        MessageBox.error("Letter is on Rejected, Cannot upload ELC letter");
                        return;
                    }
                    aWFRequestIds.push(wfRequestId);
                }
                if (aWFRequestIds.length == 0) {
                    BusyIndicator.hide();
                    MessageBox.information('Please select atleast one Employee to intiate the process.');
                    return;
                }
                MessageToast.show('Selected Employees ELC letters will be uploaded for "SENT" status!');
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext(`/${sFunctionName}(...)`);

                oOperation.setParameter("wfRequestIds", aWFRequestIds).execute().then(function () {
                    oELCTable.clearSelection();
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();
                    MessageBox.success('Request successfully submitted.');
                }.bind(this), function (oError) {
                    oELCTable.clearSelection();
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                }.bind(this));
            },

            onHold: function (oEvent) {
                var selectWFRequestId = oEvent.getSource().getBindingContext().getProperty('wfRequestId');
                var aWFRequestIds = [];
                aWFRequestIds.push(selectWFRequestId);
                var oModel = this.getView().getModel();
                var oHoldELCLetterBinding = oModel.bindList("/holdELCLetter(wfRequestId='" + aWFRequestIds[0] + "')", undefined, undefined, undefined,
                );

                oHoldELCLetterBinding.getContexts();
                oHoldELCLetterBinding.attachEventOnce("dataReceived", function (oEvent) {
                    var aContexts = oHoldELCLetterBinding.getContexts();
                    this.getView().getModel().refresh();
                }.bind(this));
            },

            clearAllFilters: function (oEvent) {
                var oTable = oEvent.getSource().getParent().getParent();
                var aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    oTable.filter(aColumns[i], null);
                }
                this._resetSortingState(oTable);
                MessageToast.show("Filters & Sorting cleared");
            },

            _resetSortingState: function (oTable) {
                oTable.getBinding().sort(null);
                var aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                }
            },

            onReject: function (oEvent) {
                var selectWFRequestId = oEvent.getSource().getBindingContext().getProperty('wfRequestId');
                this.oRejectCommentDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirm",
                    content: [
                        new Label({
                            text: "Do you want to reject?",
                            labelFor: "rejectComment"
                        }),
                        new TextArea("rejectComment", {
                            width: "100%",
                            placeholder: "Add Rejection Comment (required)",
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                this.oRejectCommentDialog.getBeginButton().setEnabled(sText.length > 0);
                            }.bind(this)
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Submit",
                        enabled: false,
                        press: function () {
                            var sText = Core.byId("rejectComment").getValue();
                            this.oRejectCommentDialog.close();
                            this.rejectELCLetterRelease(selectWFRequestId, sText);
                            this.oRejectCommentDialog.destroy();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oRejectCommentDialog.close();
                            this.oRejectCommentDialog.destroy();
                        }.bind(this)
                    })
                });

                this.oRejectCommentDialog.open();
            },

            filterGlobally: function (oEvent) {
                var sQuery = oEvent.getParameter("query");
                this._oGlobalFilter = null;

                if (sQuery) {
                    this._oGlobalFilter = globalFilter.getGlobalFilters(sQuery);
                }

                this._filter(oEvent);
            },

            _filter: function (oEvent) {
                var oFilter = null;

                if (this._oGlobalFilter && this._oPriceFilter) {
                    oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
                } else if (this._oGlobalFilter) {
                    oFilter = this._oGlobalFilter;
                } else if (this._oPriceFilter) {
                    oFilter = this._oPriceFilter;
                }

                oEvent.getSource().getParent().getParent().getBinding().filter(oFilter, "Application");
            },

            annualCompMonitorTableUpdated: function (oControlEvent) {
                var tabCountModel = this.getView().getModel("tabCountModel");
                var annualCompMonitorCount = oControlEvent.getSource().getBinding("rows").getLength();
                tabCountModel.setProperty("/annualCompMonitorCount", annualCompMonitorCount);
            },

            rejectELCLetterRelease: function (selectWFRequestId, sText) {
                BusyIndicator.show();
                var oAnnualCompTable = this.byId("idELCMonitorTable");
                var aWFRequestIds = [];
                aWFRequestIds.push(selectWFRequestId);

                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/rejectELCLetter(...)");

                oOperation.setParameter("wfRequestId", aWFRequestIds[0]).setParameter("remarks", sText).execute().then(function () {
                    oAnnualCompTable.clearSelection();
                    oModel.refresh();
                    BusyIndicator.hide();
                    MessageBox.success('Rejected Successfully.');
                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },


            onExport: async function (oEvent) {

                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MM-YYY" });//M/d/yyyy
                var formatedDate = dateFormat.format(new Date());

                var post = oEvent.getSource().getParent()?.getParent()?.getId()?.lastIndexOf('--');
                var label = '';
                label = oEvent.getSource().getParent().getParent().getId().substring(post + 4);

                //var loginUserName = this.getView().getModel('loginUserInfo').getProperty('/Name');
                //var downloadFileName = `${loginUserName}_${label}_${formatedDate}.xlsx`
                var downloadFileName = `ELCExport.xlsx`


                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = oEvent.getSource().getParent().getParent();
                }

                oTable = this._oTable;
                oRowBinding = oEvent.getSource().getParent().getParent().getBinding(); //oTable.getBinding('items');
                if (!oRowBinding) {
                    MessageBox.error("Nothing to export.Table does not have any records.");
                    return false;
                } else {
                    // Begin of add by I589796 on 06/23/2023
                    // To show Effective date in DD-MM-YYY Format in Excel , following logic has been added
                    var dataSourceForExcel = []
                    for (let i = 0; i < oRowBinding.getHeaderContext().getBinding().getContexts().length; i++) {
                        var oCurrObject = oRowBinding.getHeaderContext().getBinding().aContexts[i].getObject();
                        var oTempDate = new Date(oCurrObject.effectiveDate);
                        oCurrObject.effectiveDate = dateFormat.format(oTempDate);
                        // oCurrObject.eventReasonDescription = this.getEventReasonDescription(oCurrObject.eventReason);
                        // oCurrObject.LetterTemplateDescription = await this.getLetterTemplateDescription(oCurrObject.LetterTemplate);
                        dataSourceForExcel.push(oCurrObject);

                    }
                }
                // End of add by I589796 on 06/23/2023

                aCols = this.createColumnConfig(maps.getLabelByFieldNameForExcelDownload())

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: dataSourceForExcel,//  oRowBinding,
                    fileName: downloadFileName,
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            createColumnConfig: function (oLabelByFieldName) {
                var aCols = [];
                var oCol;
                for (const fieldName in oLabelByFieldName) {
                    oCol = {
                        label: oLabelByFieldName[fieldName],
                        property: fieldName,
                    };
                    aCols.push(oCol);
                }
                return aCols
            },

            onELCLetterPreview: function (oEvent) {
                BusyIndicator.show();
                var wfRequestId = oEvent.getSource().getBindingContext().getProperty('wfRequestId');
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/previewELCPDF(...)");
                oOperation.setParameter("wfRequestId", wfRequestId).execute().then(function () {
                    var oData = oOperation.getBoundContext().getObject();
                    const deccont = atob(oData.value[0].fileContent);
                    const byteNumbers = new Array(deccont.length);

                    for (let i = 0; i < deccont.length; i++) {
                        byteNumbers[i] = deccont.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/pdf" });
                    var pdfDocumentURL = URL.createObjectURL(blob);
                    if (!this._pdfViewer) {
                        this._pdfViewer = new PDFViewer();
                        this._pdfViewer.attachError(event => ErrorHandlerSingleton.getInstance().onError(event));
                        URLWhitelist.add("blob");
                    }
                    this._pdfViewer.setSource(pdfDocumentURL);
                    this._pdfViewer.open();
                    BusyIndicator.hide();
                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },

            onHoldAll: function () {
                BusyIndicator.show();
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/holdAllELCLetters(...)");

                oOperation.execute().then(function () {
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();
                    MessageBox.success('ELC letters on Hold successfully.');
                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },

            onReleaseAll: function () {
                BusyIndicator.show();
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/releaseAllELCLetters(...)");

                oOperation.execute().then(function () {
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();
                    MessageBox.success('All ELC letters have been released successfully.');
                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },

            // Temporary Code: Start
            onFetchWorkflows: function () {
                BusyIndicator.show();
                var oModel = this.getView().getModel();
                var oSFBinding = oModel.bindList("/SF_ELC", undefined, undefined, undefined,
                );

                oSFBinding.getContexts();
                oSFBinding.attachEventOnce("dataReceived", function (oEvent) {
                    BusyIndicator.hide();
                    var aContexts = oSFBinding.getContexts();
                    this.getView().getModel().refresh();
                }.bind(this));
            },
            onSendNotif: function () {
                BusyIndicator.show();
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/sendELCReleaseNotification(...)");

                oOperation.execute().then(function () {
                    this.getView().getModel().refresh();
                    BusyIndicator.hide();
                    //MessageBox.success('ELC letters on Hold successfully.');
                }.bind(this), function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(oError.message);
                });
            },
            // Temporary Code: End
        });
    });
