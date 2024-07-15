sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
    "use strict";

    return {
        getGlobalFilters: function (sQuery) {
            var base64EncodedQuery = btoa(sQuery);
            var filters = new Filter([
                new Filter({ path: "empCode", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "title", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "fullName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "eventReasonDescription", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "CommunicationStatus", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "CommunicationRemarks", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                //new Filter({ path: "effectiveDate", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "email", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "LetterTemplateDescription", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
            ], false);
            try {
				var iValue = parseInt(sQuery);
			} catch (e) {
				// nothing
			}
            if (!isNaN(iValue)) {
                filters.aFilters.push(new Filter({ path: "LetterTemplate", operator: FilterOperator.EQ, value1: iValue }));
            }
            return filters;  
        }
    };
});