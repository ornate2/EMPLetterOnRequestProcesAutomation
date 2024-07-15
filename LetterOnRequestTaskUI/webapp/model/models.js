sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
        },
        createBonafideModel: function () {
            var oModel = new JSONModel({
                EmpCode: '126667',
                CompanyCode: 'APL',
                LetterTemplate: '401',
                LetterDate: '30-Apr-2023',
                Title: 'Ms',
                FullName: 'Preethi Nair',
                DateOfJoining: 'May 05, 2022',
                FirstName: 'Preethi',
                Designation: 'SENIOR EXECUTIVE - SYSTEM',
                Location: 'VAKOLA',
                Division: 'HEAD OFFICE',
                Content: 'This letter has been issued for the purpose of pursuing part time MBA.',
                SigningAuthorityName: 'Anagh Agarwal',
                SigningAuthorityDesignation: 'Manager - Human Resources'
            });
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        },
        createCTCModel: function () {
            var oModel = new JSONModel({
                RequestType: 'CTC',
                RequestData: {
                    EmpCode: '126667',
                    CompanyCode: 'APL',
                    LetterTemplate: '402',
                    LetterDate: '30-Apr-2023',
                    Title: 'Ms',
                    FullName: 'Preethi Nair',
                    DateOfJoining: 'May 05, 2022',
                    FirstName: 'Preethi',
                    Designation: 'SENIOR EXECUTIVE - SYSTEM',
                    Location: 'VAKOLA',
                    Division: 'HEAD OFFICE',
                    FinancialYear: '22-2023',
                    RequestPurpose: 'Needed to persue MBA',
                    Content: 'This letter has been issued for the purpose of pursuing part time MBA.',
                    IssuePurpose: 'Higher Study',
                    SigningAuthorityName: 'Anagh Agarwal',
                    SigningAuthorityDesignation: 'Manager - Human Resources',
                    CTCComponents: [
                        {
                            Component: 'Basic',
                            PerMonth: '10000',
                            PerAnnum: '120000'
                        },
                        {
                            Component: 'HRA',
                            PerMonth: '5000',
                            PerAnnum: '60000'
                        }
                    ]
                }
            });
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        },
    };
});