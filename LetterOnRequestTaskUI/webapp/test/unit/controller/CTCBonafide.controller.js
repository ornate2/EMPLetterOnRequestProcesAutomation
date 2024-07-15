/*global QUnit*/

sap.ui.define([
	"comsapasianpaints/LetterOnRequestTaskUI/controller/CTCBonafide.controller"
], function (Controller) {
	"use strict";

	QUnit.module("CTCBonafide Controller");

	QUnit.test("I should test the CTCBonafide controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
