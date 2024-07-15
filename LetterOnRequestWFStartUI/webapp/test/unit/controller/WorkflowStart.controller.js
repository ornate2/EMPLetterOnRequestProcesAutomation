/*global QUnit*/

sap.ui.define([
	"comapl/LetterOnRequestWFStartUI/controller/WorkflowStart.controller"
], function (Controller) {
	"use strict";

	QUnit.module("WorkflowStart Controller");

	QUnit.test("I should test the WorkflowStart controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
