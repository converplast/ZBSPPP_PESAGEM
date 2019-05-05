sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		'sap/m/MessageToast'
	], function (Controller,MessageBox,MessageToast) {
		"use strict";

		return Controller.extend("agile.pesagembobina.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},
			
			getUrlOdata : function(){
				return "/sap/opu/odata/sap/ZGWPP_PESAGEM_SRV/";
			},
			
			messageAlert : function(mensagem){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.alert(mensagem,{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				});
			},
			messageError : function(mensagem){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(mensagem,{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				});
			},
			messageInfo : function(mensagem){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.information(mensagem,{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				});
			},
			
			messageToastAlert : function(mensagem){
				MessageToast.show(mensagem);
			},
			
			showReturnMessage: function(oMessage){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				
				switch(oMessage.severity){
                    case "error":
                        MessageBox.error(oMessage.message,{
							styleClass: bCompact? "sapUiSizeCompact" : ""
						});
                        break;
                        
                    case "info":
                        MessageBox.information(oMessage.message,{
							styleClass: bCompact? "sapUiSizeCompact" : ""
						});
                        break;
                        
                    case "warning":
                        MessageBox.warning(oMessage.message,{
							styleClass: bCompact? "sapUiSizeCompact" : ""
						});
                        break;
                }
				
			},
			
			getTypeFromSeverity: function(sSeverity) {
                switch(sSeverity){
                    case "error":
                        return sap.ui.core.MessageType.Error;
                        break;
                    case "info":
                        return sap.ui.core.MessageType.Information;
                        break;
                    case "warning":
                        return sap.ui.core.MessageType.Warning;
                        break;
                }
                return sap.ui.core.MessageType.Error;
            },
            
            setBusy: function() {
    		   sap.ui.core.BusyIndicator.show(0);
    		},

    		setFree: function() {
        		sap.ui.core.BusyIndicator.hide();
    		}

		});

	}
);