sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/models",
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, PDFViewer, URLWhitelist, BusyIndicator, MessageBox) {
        "use strict";

        return Controller.extend("com.sap.asianpaints.LetterOnRequestTaskUI.controller.CTCBonafide", {
            onInit: function () {
            },

            onBonafidePreview: function (event) {
                BusyIndicator.show();
                //var sModelName = 'context';
                var isLocal = false;

                var oBonafide = this.getView().getModel("context").getProperty("/RequestData");
                delete oBonafide.Comment;
                delete oBonafide.RequestPurpose;
                isLocal = true;
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/reviewBonafidePDF(...)");
                    //oOperation = oModel.bindContext("/reviewELCPDF(...)");
                oOperation.setParameter("bonafide", oBonafide).setParameter("xdpTemplate", 'BonafideForm_APL/BonafideTemplate_APL').execute().then(function () {
                //oOperation.setParameter("elc", oBonafide).setParameter("xdpTemplate", 'ELCForm_APL/ELCTemplate_APL').execute().then(function () {
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

            onAddCTCComponent: function (event) {
                var oCTC = this.getView().getModel("context").getProperty("/RequestData/CTCComponents");
                oCTC.push({
                    Component: "",
                    PerMonth: "",
                    PerAnnum: ""
                });
                this.getView().getModel("context").setProperty("/RequestData/CTCComponents", oCTC);

            },

            onCTCComponentDelete: function (event) {
                var sPath = event.getParameter("listItem").getBindingContextPath();
                var index = sPath.split("/")[3];
                var oCTC = this.getView().getModel("context").getProperty("/RequestData/CTCComponents");
                oCTC.splice(index, 1);
                this.getView().getModel("context").setProperty("/RequestData/CTCComponents", oCTC);
            },

            onCTCPreview: function (event) {
                BusyIndicator.show();
                var sModelName = 'context';
                var isLocal = false;
                
                    var oCTC = this.getView().getModel("context").getProperty("/RequestData");
                    delete oCTC.Comment;
                    isLocal = true;
                
                var oModel = this.getView().getModel(),
                    oOperation = oModel.bindContext("/reviewCTCPDF(...)");

                oOperation.setParameter("ctc", oCTC).setParameter("xdpTemplate", 'CTCForm_APL/CTCTemplate_APL').execute().then(function () {
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
        });
    });
