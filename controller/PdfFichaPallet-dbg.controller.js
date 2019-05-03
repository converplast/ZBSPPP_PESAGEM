sap.ui.define([
		"agile/pesagembobina/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"agile/pesagembobina/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("agile.pesagembobina.controller.PdfFichaPallet", {

			formatter: formatter,		

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.getRouter().getRoute("pdfFichaPallet").attachPatternMatched(this._onObjectMatched, this);
			},
					
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */
			onNavBack : function() {
				history.go(-1);
			},
			
			
			_onObjectMatched : function (oEvent) {
				
				this._flag = false;
				this._oModel = this.getOwnerComponent().getModel();				
				var _this = this;
				
				var _url = sap.ui.getCore().getModel("url").getData().url; 
				if(_url){

					var oModel = this._oModel;
					var oVBox = _this.getView().byId("pdfBox");
		    		var aAggs = oVBox.getAggregation("items");
		    		if(aAggs){
		    			oVBox.destroyItems();
		    		}
		    		var oHtml = new sap.ui.core.HTML();
		    		var sPdfURL = _url; 
		    		
		    		oHtml.setContent("<iframe id='ifrmPdf' scrolling='no' src="+ sPdfURL 
		    				+ " width='100%' height='100%'></iframe>");

		    		oVBox.addItem(oHtml);
		    		oVBox.setFitContainer(true);
				}
				
			}
			
		});
	}
);			