jQuery.sap.require("agile.pesagembobina.js.BrowserPrint");

sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"agile/pesagembobina/model/Impressora"
	], function (UI5Object, MessageBox, JSONModel, Impressora) {
		"use strict";

		return UI5Object.extend("agile.pesagembobina.controller.PrinterHandler", {

			constructor : function (oComponent) {
				this._avaiablePrinters = null;
				this._selectedCategory = null;
				this._defaultPrinter = null;
				this._selectedPrinter = null;
				this._defaultMode = true;
				this._oComponent = oComponent;
				var that = this;
			},
			debugger,
			handleSetupPrint : function(){
				var that = this;
				BrowserPrint.getDefaultDevice('printer', function(printer){

					that._selectedPrinter = printer;
					
					BrowserPrint.getLocalDevices(function(printers){
						that._avaiablePrinters = printers;
						var aImpressoras = [];

						$.each(printers,function(index,item){
							if(item.connection === 'usb'){
								aImpressoras.push(new Impressora(item.name, item.name))
							}
						});
						
						if(aImpressoras.length === 0){
							//var sMessage = "Nenhuma Impressora Encontrada";
							//that.printerError(sMessage);
							//that._oComponent.getView().byId("btnImprimir").setEnabled(false);
							return;
						}else{
							var oModelImpressora = new JSONModel(aImpressoras);
							that._oComponent.setModel(oModelImpressora,"impressoras");							
						}
						
					}, undefined, 'printer');
				},
				function(error_response){
					alert("Erro na impressora " + error_response);
				});
				
			},
			
			printData : function(sCodZPL){
				var that = this;
				this.checkPrinterStatus( function (text){
					debugger
					if (text == "Ready to Print"){
						that._selectedPrinter.send(sCodZPL, that.printComplete, that.printerError);
					}else{
						that.printerError(text);
					}
				});
			},

			checkPrinterStatus: function(finishedFunction){
				var that = this;
				this._selectedPrinter.sendThenRead("~HQES",
					function(text){
							var that = this;
							var statuses = [];
							var ok = false;
							var is_error = text.charAt(70);
							var media = text.charAt(88);
							var head = text.charAt(87);
							var pause = text.charAt(84);
							// check each flag that prevents printing
							if (is_error == '0'){
								ok = true;
								statuses.push("Ready to Print");
							}
							if (media == '1')
								statuses.push("Paper out");
							if (media == '2')
								statuses.push("Ribbon Out");
							if (media == '4')
								statuses.push("Media Door Open");
							if (media == '8')
								statuses.push("Cutter Fault");
							if (head == '1')
								statuses.push("Printhead Overheating");
							if (head == '2')
								statuses.push("Motor Overheating");
							if (head == '4')
								statuses.push("Printhead Fault");
							if (head == '8')
								statuses.push("Incorrect Printhead");
							if (pause == '1')
								statuses.push("Printer Paused");
							if ((!ok) && (statuses.Count == 0))
								statuses.push("Error: Unknown Error");
							finishedFunction(statuses.join());
				}, that.printerError);
				
			},
			
			printComplete : function(){
				alert("Impressão realizada com Sucesso");
//				var bCompact = !!that._oComponent.getView().$().closest(".sapUiSizeCompact").length;
//				MessageBox.alert("Impressão realizada com Sucesso",{
//					styleClass: bCompact? "sapUiSizeCompact" : ""
//				});
			},
			
			printerError : function(text){
				alert("Um Erro Ocorreu: " + text);
//				var bCompact = !!that._oComponent.getView().$().closest(".sapUiSizeCompact").length;
//				MessageBox.alert("Um Erro Ocorreu: " + text,{
//					styleClass: bCompact? "sapUiSizeCompact" : ""
//				});
			}
			
			
		});
	}
);