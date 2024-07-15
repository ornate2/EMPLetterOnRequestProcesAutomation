sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast) {
    "use strict";

    return Controller.extend(
      "com.apl.LetterOnRequestWFStartUI.controller.WorkflowStart",
      {
        onInit: function () {
          this.getView().setModel(
            new sap.ui.model.json.JSONModel({
              type: '',
              purpose: '',
              comment: ''
            }), "userInput"
          );
        },

        startWorkflowInstance: function () {
          debugger
          var definitionId = "com.apl.employee.letteronrequest";
          var userInputModel = this.getView().getModel("userInput");
          /*var initialContext = {
            type: userInputModel.getProperty("/type"),
            purpose: userInputModel.getProperty("/purpose")
          };*/
          var initialContext = this._getContextObject(userInputModel.getProperty("/type"));

          var data = {
            definitionId: definitionId,
            context: initialContext,
          };

          $.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/workflow-instances",
            method: "POST",
            async: false,
            contentType: "application/json",
            headers: {
              "X-CSRF-Token": this._fetchToken(),
            },
            data: JSON.stringify(data),
            success: function (result, xhr, data) {
              userInputModel.setProperty("/type", "");
              userInputModel.setProperty("/purpose", "");
              userInputModel.setProperty("/comment", "");
              MessageToast.show('Request has been submitted suceessfully.');
            },
            error: function (request, status, error) {
              userInputModel.setProperty("/type", "");
              userInputModel.setProperty("/purpose", "");
              userInputModel.setProperty("/comment", "");
              MessageToast.show('Error occured while submitting the request.');
            },
          });
        },

        _fetchToken: function () {
          var fetchedToken;

          jQuery.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },

        _getWorkflowRuntimeBaseURL: function () {
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);

          return appModulePath + "/bpmworkflowruntime/v1";
        },

        _getContextObject: function (type) {
          var userInputModel = this.getView().getModel("userInput");
          var contextObj;

          switch (type) {
            case 'CTC':
              contextObj = {
                "RequestData": {
                  "EmpCode": "126667",
                  "CompanyCode": "APL",
                  "LetterTemplate": "402",
                  "LetterDate": "30-Apr-2023",
                  "Title": "Ms",
                  "FullName": "Preethi Nair",
                  "DateOfJoining": "May 05, 2022",
                  "FirstName": "Preethi",
                  "Designation": "SENIOR EXECUTIVE - SYSTEM",
                  "Location": "VAKOLA",
                  "Division": "HEAD OFFICE",
                  "FinancialYear": "22-2023",
                  "RequestPurpose": userInputModel.getProperty("/purpose"),
                  "Content": "",
                  "IssuePurpose": "",
                  "SigningAuthorityName": "Anagh Agarwal",
                  "SigningAuthorityDesignation": "Manager - Human Resources",
                  "Comment": userInputModel.getProperty("/comment"),
                  "CTCComponents": []
                },
                "RequestType": userInputModel.getProperty("/type")
              }
              break;

            case 'Bonafide':
              contextObj = {
                "RequestData": {
                    "EmpCode": "126667",
                    "CompanyCode": "APL",
                    "LetterTemplate": "401",
                    "LetterDate": "30-Apr-2023",
                    "Title": "Ms",
                    "FullName": "Preethi Nair",
                    "DateOfJoining": "May 05, 2022",
                    "FirstName": "Preethi",
                    "Designation": "SENIOR EXECUTIVE - SYSTEM",
                    "Location": "VAKOLA",
                    "Division": "HEAD OFFICE",
                    "Content": "",
                    "SigningAuthorityName": "Neha Yadav",
                    "SigningAuthorityDesignation": "Manager - Human Resources",
                    "RequestPurpose": userInputModel.getProperty("/purpose"),
                    "Comment": userInputModel.getProperty("/comment"),
                },
                "RequestType": userInputModel.getProperty("/type")
            }
              break;
          }

          return contextObj;
        }
      }
    );
  }
);
