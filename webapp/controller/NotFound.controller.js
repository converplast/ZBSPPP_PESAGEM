sap.ui.define([
		"agile/pesagembobina/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("agile.pesagembobina.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);