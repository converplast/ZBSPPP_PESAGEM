jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"agile/pesagembobina/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"agile/pesagembobina/test/integration/pages/Worklist",
		"agile/pesagembobina/test/integration/pages/Object",
		"agile/pesagembobina/test/integration/pages/NotFound",
		"agile/pesagembobina/test/integration/pages/Browser",
		"agile/pesagembobina/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "agile.pesagembobina.view."
	});

	sap.ui.require([
		"agile/pesagembobina/test/integration/WorklistJourney",
		"agile/pesagembobina/test/integration/ObjectJourney",
		"agile/pesagembobina/test/integration/NavigationJourney",
		"agile/pesagembobina/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});