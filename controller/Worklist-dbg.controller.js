jQuery.sap.require("agile.pesagembobina.js.mask.mask");
jQuery.sap.require("agile.pesagembobina.js.mask.maskMoney");

sap.ui.define([
	"agile/pesagembobina/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"agile/pesagembobina/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/Button',
	'sap/m/Dialog',
	"sap/m/Input",
	"agile/pesagembobina/model/HeaderPesagem",
	"agile/pesagembobina/model/ItensPesagem",
	"agile/pesagembobina/model/TotaisPesagem",
	/*"agile/pesagembobina/controller/PrinterHandler",*/
	/*"agile/pesagembobina/controller/ZebraHandler",*/
	//"sap/ui/table/Table",
	//"sap/ui/table/Column",
	'sap/m/Label',
	'sap/m/Text'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Button, Dialog, Input, HeaderPesagem, ItensPesagem,
	TotaisPesagem, /*PrinterHandler, ZebraHandler,*/ Label, Text) {
	"use strict";

	return BaseController.extend("agile.pesagembobina.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay;
			debugger,
			var that = this;
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href])
			});
			this.setModel(oViewModel, "worklistView");

			this._oTara = this.getView().byId("tara");
			this._oOrdem = this.getView().byId("ordem");
			this._oPallet = this.getView().byId("pallet");
			this._oNre = this.getView().byId("txtNRE")
			this._oBtnPesagem = this.getView().byId("btnPesagem");
			this._oBtnRedefinirTara = this.getView().byId("btnRedefinirTara");
			this._oBtnCancelar = this.getView().byId("btnCancelar");
			this._oBtnSalvar = this.getView().byId("btnSalvar");
			this._oTotPesagem = this.getView().byId("totPesagem");
			this._oTotPesoBruto = this.getView().byId("totPesoBruto");
			this._oTotPesoLiquido = this.getView().byId("totPesoLiquido");
			this._oTotQtd = this.getView().byId("totQtd");
			this._oTotQtdTotal = this.getView().byId("totQtdTotal");
			this._oBtnNovaPesagem = this.getView().byId("btnNovaPesagem");
			this._oBtnDesmembPalete = this.getView().byId("btnDesmembPalete");
			this._oBtnPesarDiferenca = this.getView().byId("btnPesarDiferenca");
			this._oBtnFinalizarPallet = this.getView().byId("btnFinalizarPallet");
			this._oBtnRomaneio = this.getView().byId("btnRomaneio");
			this._oBtnFormularioA4 = this.getView().byId("btnFormularioA4");
			this._oBtnFichaPallet = this.getView().byId("btnFichaPallet");
			this._oBtnImprimirEtiquetas = this.getView().byId("btnImprimirEtiquetas");

			this._fPesoTotal = 0;
			this._fOldOrdem = "";
			this._fOldPallet = "";
			this._fCancDifSimNao = "";
			this._sPesoBalancaAtual = "";
			this._sTpUnidadeMedida = "";
			this._sOrdem = "";
			this._sPallet = "";
			this._sNre = "";
			this._sTicketOrigem = "";
			this._sDescNre = "";
			this._sEfetivada = "";
			this._sDifdesmemb = "";
			this._sMsg = "";
			this._sPesoPallet = "";

			this._fQtdeBobinasTotal = 0,
				this._fTaraTotal = 0;

			$('#__component0---worklist--tara-inner').mask("##0.000", {
				placeholder: "0.000",
				reverse: true
			});
			//$('#__component0---worklist--tara-inner').maskMoney({showSymbol:true, symbol:"R$", decimal:",", thousands:"."});

			//this._oPrinterHandler = new PrinterHandler(this);
			$(window).bind('beforeunload', function (e) {
				//$( window ).unload(function() {
				var sOrdem = that._oOrdem.getValue();
				var sPallet = that._oPallet.getValue();
				that._validaLockTicket(sOrdem, sPallet);

			});
			//				this._oPrinterHandler = new ZebraHandler(this);
			//				this._oPrinterHandler.handleSetupPrint();

		},

		onAfterRendering: function () {
			var that = this;
			this._oTimeoutPeso = setInterval(function () {
				that._lerPesoBalanca();
			}, 1000);
			if (!this._sEfetivada) {
				this._openLeituraCodBarras();
			}
			sap.ui.getCore().byId("backBtn").attachPress(this, function (oEvent) {
				//oEvent.preventDefault();
				var sOrdem = this._oOrdem.getValue();
				var sPallet = this._oPallet.getValue();

				this._validaLockTicket(sOrdem, sPallet);
			}.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onNavBack: function () {
			history.go(-1);
		},

		/*onBack: function(){
			debugger;
		},*/

		onHandleOpenPesagem: function () {

			var that = this;
			debugger;
			if (this._sTpUnidadeMedida === "" || this._sTpUnidadeMedida === "KG") {

				this._openLeituraCodBarras();
				this._oTimeoutPeso = setInterval(function () {
					that._lerPesoBalanca();
				}, 1000);
			} else {
				this._openLeituraQuantidade();
				this._oTimeoutPesoQtd = setInterval(function () {
					that._lerPesoBalanca();
				}, 1000);
				debugger;
			}

		},

		onHandleAfterCloseDialogQtd: function () {
			clearInterval(this._oTimeoutPesoQtd);
			debugger;
			this._limpaCamposQtd();
		},

		onHandleAfterCloseDialogCod: function () {
			clearInterval(this._oTimeoutPeso);

			this._limpaCamposCodBarras();
		},

		handleEnableButtonPesagem: function (oControlEvent) {
			var tara = this._oTara.getValue();

			if (tara != "") {
				this._oBtnPesagem.setEnabled(true);
			} else {
				this._oBtnPesagem.setEnabled(false);
			}
		},

		handleRedefinirTara: function () {

			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;

			var sOrdem = this._oOrdem.getValue();
			var sPallet = this._oPallet.getValue();
			var sTara = this._oTara.getValue();

			if (sTara === "") {
				this.messageAlert(that.getResourceBundle().getText("messagePreenchimentoTara"));
				return;
			}

			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));
			aFilter.push(new Filter("Tara", FilterOperator.EQ, sTara));

			oModel.read("/ZSTPP_PESAG_ITEMTARASet", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {

					$.each(oDataPesagem.results, function (index, item) {
						aItensPesagem.push(new ItensPesagem(item));
					});

					var oModelItensPesagem = new JSONModel(aItensPesagem);
					that.getView().setModel(oModelItensPesagem, "itensPesagem");
					that._calculaTotais();
				}
			});

		},

		handleRecuperarPesagem: function () {

			var that = this;
			if (!that.recuperarDialog) {
				that.recuperarDialog = new Dialog({
					title: 'Recuperar Pesagem',
					contentWidth: "150px",
					contentHeight: "100px",
					resizable: false,
					//content: [new Input("txtRecuperarOrdem",{type:"Number", placeholder : "Ordem"}),new Input("txtRecuperarPallet",{type:"Number", placeholder : "Ticket"})],
					content: [new Input("txtRecuperarPallet", {
						type: "Number",
						placeholder: "Ticket"
					})],
					beginButton: new Button({
						text: 'Confirmar',
						press: function () {

							//var oOrdem = sap.ui.getCore().byId("txtRecuperarOrdem");
							//Valor da ORDEM será ignorada
							var oOrdem = sap.ui.getCore().byId("txtRecuperarPallet");
							var sOrdem = oOrdem.getValue();

							var oPallet = sap.ui.getCore().byId("txtRecuperarPallet");
							var sPallet = oPallet.getValue();

							if (sOrdem != "" && sPallet != "") {
								that._recuperarDadosOrdem(sOrdem, sPallet);
								that.recuperarDialog.close();
							} else {
								that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoRecuperarPesagem"));
							}

						}
					}),
					endButton: new Button({
						text: 'Cancelar',
						press: function () {
							that.recuperarDialog.close();
						}
					})

				});

				//to get access to the global model
				this.getView().addDependent(that.recuperarDialog);

				that.recuperarDialog.open();
			} else {
				that.recuperarDialog.open();
			}

		},

		handleSalvarItemPesagem: function () {
			this._salvarItemPesagem(this._sOrdem, this._sPallet, this._fQtdeBobinasTotal, this._fTaraTotal);
			this._oDialogCodBarras.close();
		},

		onHandleCancelarPesagem: function () {
			var that = this;

			var dialog = new Dialog({
				title: this.getResourceBundle().getText("titleConfirm"),
				type: 'Message',
				content: [
					new Text('confirmAlertCancelar', {
						text: this.getResourceBundle().getText("mesageConfirmCancelar")
					})
				],
				beginButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoConfirmar"),
					press: function () {

						var sUrl = that.getUrlOdata();
						var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
						var aFilter = [];
						var aItensPesagem = [];
						//var that = this;

						var sOrdem = that._oOrdem.getValue();
						var sPallet = that._oPallet.getValue();
						var sTara = that._oTara.getValue();

						that._validaLockTicket(sOrdem, sPallet);

						aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
						aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

						oModel.read("/ZSTPP_PESAG_CABCANCELARSet", {
							filters: aFilter,
							async: false,
							success: function (oDataPesagem, oResponsePesagem) {
								that._limpaCamposTela();
							}
						});

						dialog.close();
					}
				}),
				endButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoCancelar"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		onHandleDialogPesoPalletCancelButton: function (oControlEvent) {
			this._oDialogPesoPallet.close();
		},

		onDesmembrarPallet: function () {

			var that = this;
			if (!that.recuperarDialog) {
				that.recuperarDialog = new Dialog({
					title: 'Recuperar Pesagem',
					contentWidth: "150px",
					contentHeight: "100px",
					resizable: false,
					content: [new Input("txtRecuperarOrdem", {
						type: "Number",
						placeholder: "Ordem"
					}), new Input("txtRecuperarPallet", {
						type: "Number",
						placeholder: "Ticket"
					})],
					beginButton: new Button({
						text: 'Confirmar',
						press: function () {

							var oOrdem = sap.ui.getCore().byId("txtRecuperarOrdem");
							var sOrdem = oOrdem.getValue();

							var oPallet = sap.ui.getCore().byId("txtRecuperarPallet");
							var sPallet = oPallet.getValue();

							if (sOrdem != "" && sPallet != "") {
								that._recuperarDadosOrdem(sOrdem, sPallet);
								that.recuperarDialog.close();
							} else {
								that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoRecuperarPesagem"));
							}

						}
					}),
					endButton: new Button({
						text: 'Cancelar',
						press: function () {
							that.recuperarDialog.close();
						}
					})

				});

				//to get access to the global model
				this.getView().addDependent(that.recuperarDialog);

				that.recuperarDialog.open();
			} else {
				that.recuperarDialog.open();
			}

		},

		onHandleOpenDialogPesoPallet: function (oControlEvent) {

			if (!this._oDialogPesoPallet) {
				this._oDialogPesoPallet = sap.ui.xmlfragment("agile.pesagembobina.view.PesoPalletDialog", this);
			}

			this._oDialogPesoPallet.setModel(this.getView().getModel("headerPesagem"), "headerPesagem");

			this._oDialogPesoPallet.open();

		},

		onHandleSalvarPesagem: function () {

			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var oTableItens = sap.ui.getCore().byId("tableItensPesagem");
			var aFilter = [];
			var aItensPesagem = [];

			var that = this;

			var sOrdem = this._oOrdem.getValue();
			var sPallet = this._oPallet.getValue();
			var sTara = this._oTara.getValue();

			var oHeaderPesagem = this.getView().getModel("headerPesagem").getData();

			//Verifica se o campo peso PALLET está preenchido antes do save
			/*if(oHeaderPesagem.Peso_Pallet === ""){
				this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoPesoPallet"));
				return;
			}else{
				var fPesoPallet = parseFloat(oHeaderPesagem.Peso_Pallet);
				 if(fPesoPallet <= 0){
					 this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoPesoPalletInvalido"));
					 return;
				 }
			}*/

			//Verifica se o campo NRE está preenchido antes do save
			if (oHeaderPesagem.Nre === "") {
				this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoNre"));
				return;
			} else {
				var fNre = parseFloat(oHeaderPesagem.Nre);
				if (fNre <= 0) {
					this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoNreInvalido"));
					return;
				}
			}

			if (!oHeaderPesagem.Desmembramento && !oHeaderPesagem.Difdesmemb) {
				oModel.create("/ZSTPP_PESAG_CABSet", oHeaderPesagem, {
					success: function (oDataPesagem, oResponsePesagem) {
						var message = oResponsePesagem.headers["my-custom-message"];
						if (message) {
							that.messageAlert(message);
						} else {
							that._validaLockTicket(that._sOrdem, that._sPallet);
							that._recuperarDadosOrdem(that._sOrdem, that._sPallet);

							that.messageToastAlert(that.getResourceBundle().getText("labelAlertSalvar"));
							that._oBtnRedefinirTara.setVisible(false);
							that._oBtnCancelar.setVisible(false);
							that._oBtnSalvar.setVisible(false);
							that._oBtnNovaPesagem.setVisible(true);
							that._oBtnFinalizarPallet.setVisible(false);
							that._oBtnDesmembPalete.setVisible(false);
							that._oBtnPesarDiferenca.setVisible(false);
							that._oBtnPesagem.setEnabled(false);
							that._oBtnRomaneio.setVisible(false);
							that._oBtnFormularioA4.setVisible(false);
							that._oBtnFichaPallet.setVisible(true);
							that._oBtnImprimirEtiquetas.setVisible(true);
							if (that._oDialogPesoPallet) {
								that._oDialogPesoPallet.close();
							}
						}
					}
				});
			} else if (oHeaderPesagem.Desmembramento) {
				var oModelItem = that.getView().getModel("itensPesagem");
				var oModelHeader = that.getView().getModel("headerPesagem");
				var aHeaderPesagem = oModelHeader.getData();
				var aItensPesagem = oModelItem.getData();
				var listBatch = {};

				listBatch.Aufnr = aHeaderPesagem.Aufnr;
				listBatch.Pallet = aHeaderPesagem.Pallet;
				listBatch.Peso_Pallet = String(aHeaderPesagem.Peso_Pallet);
				listBatch.Nlenr = aHeaderPesagem.Nlenr;
				listBatch.Nre = aHeaderPesagem.Nre;
				listBatch.TicketOrigem = aHeaderPesagem.TicketOrigem;
				listBatch.Desmembramento = true;
				listBatch.CABtoITEM = aItensPesagem;

				oModel.create("/SAVE_DESM_CABSet", listBatch, {
					success: function (oDataPesagem, oResponsePesagem) {
						var message = oResponsePesagem.headers["my-custom-message"];
						if (message) {
							that.messageAlert(message);
						} else {
							debugger;
							that._sOrdem = oDataPesagem.Aufnr;
							that._sPallet = oDataPesagem.Pallet;
							that._recuperarDadosOrdem(that._sOrdem, that._sPallet);

							that.messageToastAlert(that.getResourceBundle().getText("labelAlertSalvar"));
							/*that._oBtnRedefinirTara.setVisible(false);
				            	 that._oBtnCancelar.setVisible(false);
				            	 that._oBtnSalvar.setVisible(false);
				            	 that._oBtnNovaPesagem.setVisible(true);
				            	 that._oBtnFinalizarPallet.setVisible(false);
				            	 that._oBtnDesmembPalete.setVisible(false); 
				            	 that._oBtnPesarDiferenca.setVisible(false); 
				            	 that._oBtnPesagem.setEnabled(false);
				            	 that._oBtnRomaneio.setVisible(true);
				            	 that._oBtnFormularioA4.setVisible(true);
				            	 that._oBtnFichaPallet.setVisible(true);
				            	 that._oBtnImprimirEtiquetas.setVisible(true);*/
							if (that._oDialogPesoPallet) {
								that._oDialogPesoPallet.close();
							}
						}
					},
					error: function (err) {
						debugger;
						//that.messageToastAlert(oError);
						//Error Callback
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.show((JSON.parse(err.response.body).error.message.value));
					}

				});
			} else if (oHeaderPesagem.Difdesmemb) {
				that._NovoPalletDifDesmemb();

			}
		},

		onHandleFinalizarPallet: function () {

			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;

			var sOrdem = this._oOrdem.getValue();
			var sPallet = this._oPallet.getValue();
			var sTara = this._oTara.getValue();

			var oHeaderPesagem = this.getView().getModel("headerPesagem").getData();

			//Verifica se o campo peso PALLET está preenchido antes do save
			if (oHeaderPesagem.Peso_Pallet === "") {
				this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoPesoPallet"));
				return;
			} else {
				var fPesoPallet = parseFloat(oHeaderPesagem.Peso_Pallet);
				if (fPesoPallet <= 0) {
					this.messageAlert(that.getResourceBundle().getText("alertPreenchimentoPesoPalletInvalido"));
					return;
				}
			}

			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));
			aFilter.push(new Filter("Peso_Pallet", FilterOperator.EQ, oHeaderPesagem.Peso_Pallet));

			oModel.read("/ZSTPP_PESAG_PESTOTSet", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {

					that.messageToastAlert(that.getResourceBundle().getText("labelAlertPesTot"));
					that._oBtnRedefinirTara.setVisible(false);
					that._oBtnCancelar.setVisible(false);
					that._oBtnSalvar.setVisible(false);
					that._oBtnNovaPesagem.setVisible(true);
					that._oBtnPesagem.setEnabled(false);
					that._oBtnRomaneio.setVisible(true);
					that._oBtnFormularioA4.setVisible(true);
					that._oBtnFichaPallet.setVisible(true);
					that._oBtnImprimirEtiquetas.setVisible(true);
					that._oBtnFinalizarPallet.setVisible(true);
					that._oBtnDesmembPalete.setVisible(false);
					that._oBtnPesarDiferenca.setVisible(false);
				}
			});

		},

		onHandleDesmembrarPallet: function () {

			var that = this;
			if (!that.desmembrarPalletDialog) {
				that.desmembrarPalletDialog = new Dialog({
					title: 'Desmembrar Pallet',
					contentWidth: "150px",
					contentHeight: "100px",
					resizable: false,
					content: [new Input("txtDesmembrarPallet", {
						type: "Number",
						placeholder: "Ticket"
					})],
					beginButton: new Button({
						text: 'Confirmar',
						press: function () {

							var oPallet = sap.ui.getCore().byId("txtDesmembrarPallet");
							var sPallet = oPallet.getValue();

							if (sPallet != "") {
								that._recuperarDadosDesmemb(sPallet);
								that.desmembrarPalletDialog.close();
							} else {
								that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoDesmembrarPallet"));
							}

						}
					}),
					endButton: new Button({
						text: 'Cancelar',
						press: function () {
							that.desmembrarPalletDialog.close();
						}
					})

				});

				//to get access to the global model
				this.getView().addDependent(that.desmembrarPalletDialog);

				that.desmembrarPalletDialog.open();
			} else {
				that.desmembrarPalletDialog.open();
			}

		},

		onHandlePesarDiferenca: function () {

			var that = this;
			if (!that.pesarDiferencaDialog) {
				that.pesarDiferencaDialog = new Dialog({
					title: 'Pesar Diferença Desmembramento',
					contentWidth: "150px",
					contentHeight: "100px",
					resizable: false,
					content: [new Input("txtPesarDiferenca", {
						type: "Number",
						placeholder: "Ticket"
					})],
					beginButton: new Button({
						text: 'Confirmar',
						press: function () {

							var oPallet = sap.ui.getCore().byId("txtPesarDiferenca");
							var sPallet = oPallet.getValue();

							if (sPallet != "") {
								that._recuperarDadosDif(sPallet);
								that.pesarDiferencaDialog.close();
							} else {
								that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoDesmembrarPallet"));
							}

						}
					}),
					endButton: new Button({
						text: 'Cancelar',
						press: function () {
							that.pesarDiferencaDialog.close();
						}
					})

				});

				//to get access to the global model
				this.getView().addDependent(that.pesarDiferencaDialog);

				that.pesarDiferencaDialog.open();
			} else {
				that.pesarDiferencaDialog.open();
			}

		},

		onSubmitNRE: function (oControlEvent) {
			var fNre = oControlEvent.mParameters.value;
			var fErro = this._descNre(fNre);
		},

		_descNre: function (fNre) {

			var that = this;
			var aFilters = [];
			var oModel = this.getView().getModel();

			aFilters.push(new Filter("Aufnr", FilterOperator.EQ, this._oOrdem.getValue()));
			aFilters.push(new Filter("Pallet", FilterOperator.EQ, this._sPallet));
			aFilters.push(new Filter("Nre", FilterOperator.EQ, fNre));
			aFilters.push(new Filter("TicketOrigem", FilterOperator.EQ, this._sTicketOrigem));

			oModel.read("/ZSTPP_PESAG_NRESet", {
				filters: aFilters,
				async: false,
				success: function (oDataPesagem, oResponse) {

					that._sMsg = oDataPesagem.results[0].MsgErro;
					if (that._sMsg) {
						var oHeaderPesagem = that.getView().getModel("headerPesagem").getData();
						oHeaderPesagem.DescNre = "";
						var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
						that.messageAlert(that._sMsg);
						return true;
					} else {
						var oHeaderPesagem = that.getView().getModel("headerPesagem").getData();
						oHeaderPesagem.DescNre = oDataPesagem.results[0].DescNre;
						oHeaderPesagem.Nre = oDataPesagem.results[0].Nre;
						var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
						return false;
					}
				}
			});
			return true;
		},

		onHandleNovaPesagem: function () {

			var that = this;
			var sOrdem = that._oOrdem.getValue();
			var sPallet = that._oPallet.getValue();

			var dialog = new Dialog({
				title: this.getResourceBundle().getText("titleConfirm"),
				type: 'Message',
				content: [
					new Text('confirmAlertNovaPesagem', {
						text: this.getResourceBundle().getText("mesageConfirmNovaPesagem")
					})
				],
				beginButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoConfirmar"),
					press: function () {
						that._validaLockTicket(sOrdem, sPallet);
						that._limpaCamposTela();
						dialog.close();
					}
				}),
				endButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoCancelar"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		_NovoPalletDifDesmemb: function () {

			var that = this;
			var sOrdem = that._oOrdem.getValue();
			var sPallet = that._oPallet.getValue();

			if (sPallet) {
				//Se o PALLET estiver preenchido obrigatóriamente a opção precisa ser SIM
				var oHeaderPesagem = that.getView().getModel("headerPesagem").getData();
				oHeaderPesagem.DifSimNao = true;
				that._fCancDifSimNao = false;
				var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
				that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
				that._SaveDifDesmemb();
				dialog.close();
			} else {
				var dialog = new Dialog({
					title: this.getResourceBundle().getText("titleNovoPalete"),
					type: 'Message',
					content: [
						new Text('consumirPalete', {
							text: this.getResourceBundle().getText("mensagemConsumirPalete")
						})
					],
					buttons: [new Button({
							text: this.getResourceBundle().getText("labelBotaoSim"),
							press: function () {
								var oHeaderPesagem = that.getView().getModel("headerPesagem").getData();
								oHeaderPesagem.DifSimNao = true;
								that._fCancDifSimNao = false;
								var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
								that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
								that._SaveDifDesmemb();
								dialog.close();
							}
						}),

						new Button({
							text: this.getResourceBundle().getText("labelBotaoNao"),
							press: function () {
								var oHeaderPesagem = that.getView().getModel("headerPesagem").getData();
								oHeaderPesagem.DifSimNao = false;
								that._fCancDifSimNao = false;
								var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
								that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
								that._SaveDifDesmemb();
								dialog.close();
							}
						}),

						new Button({
							text: this.getResourceBundle().getText("labelBotaoCancelar"),
							press: function () {
								that._fCancDifSimNao = true;
								dialog.close();
							}
						})
					],
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

			}

		},

		handleFormataData: function (data) {
			if (data) {
				var dDate = new Date(data);
				dDate.setHours(dDate.getHours() + 3)
				var sDate = dDate.getDate() + "/" + (dDate.getMonth() + 1) + "/" + dDate.getFullYear();
				return sDate;
			}
		},

		handleSubmitCodigoBarras: function () {

			var that = this;
			debugger
			//var oOrdem = sap.ui.getCore().byId("txtCodigoBarras");
			var sOrdem = this._oTxtCodBarras.getValue();
			var aOrdem = [];
			debugger
			if (sOrdem != "") {
				aOrdem = sOrdem.split("#");

				debugger;

				if (that._sOrdem === "") {
					that._buscaDadosOrdem(aOrdem[1]);
				} else {
					if ((that._sOrdem === aOrdem[1]) || (aOrdem[1] === "")) {
						var vSwitch = sap.ui.getCore().byId("swtTipoPesagem");
						var valorSwitch = vSwitch.getState();
						var vPesoAtual = this._oTxtPesoAtual.getValue();

						if (valorSwitch === false && (vPesoAtual === "" || vPesoAtual == 0)) {
							that.messageAlert(that.getResourceBundle().getText("alertPesoVazio"));
						} else {
							that._buscaItensPesagem(that._sOrdem, that._sPallet, 0, 0);
						}
					} else {
						that.messageAlert(that.getResourceBundle().getText("alertOrdemDivergente"));
					}
				}

			} else {
				that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoCodBarras"));
			}

		},

		handleOpenTableActions: function (oEvent) {
			var oButton = oEvent.getSource();
			var that = this;
			var aFilter = [];
			//
			var oModelHeaderPesagem = this.getView().getModel("headerPesagem");
			var oModelHeaderPesagemData = oModelHeaderPesagem.getData();
			debugger
			if (!oModelHeaderPesagemData.TicketOrigem) {
				if (this._sEfetivada != "") {
					return;
				}
			}

			if (this._oActionSheet) {
				this._oActionSheet.destroy(true);
			}
			//this._oActionSheet.close();
			this._oActionSheet = new sap.m.ActionSheet("actionSheet1", {
				showCancelButton: false,
				buttons: [
					new sap.m.Button('actionPrint', {
						icon: "sap-icon://print",
						text: this.getResourceBundle().getText("labelImprimirEtiqueta"),
						press: function () {

							var table = that.getView().byId("tableItensPesagem");
							$.each(table.getSelectedIndices(), function (index, item) {
								var sAufnr = table.getContextByIndex(item).getObject().Aufnr;
								var sPallet = table.getContextByIndex(item).getObject().Pallet;
								var sSequencia = table.getContextByIndex(item).getObject().Sequencia;

								aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sAufnr));
								aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));
								aFilter.push(new Filter("Sequencia", FilterOperator.EQ, sSequencia));
							});

							that._imprimirEtiquetaPacote(aFilter);
						}
					}),
					new sap.m.Button('actionSheetButton', {
						icon: "sap-icon://delete",
						text: this.getResourceBundle().getText("labelExcluirItem"),
						press: function () {

							var table = that.getView().byId("tableItensPesagem");
							$.each(table.getSelectedIndices(), function (index, item) {
								var sAufnr = table.getContextByIndex(item).getObject().Aufnr;
								var sPallet = table.getContextByIndex(item).getObject().Pallet;
								var sSequencia = table.getContextByIndex(item).getObject().Sequencia;

								aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sAufnr));
								aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));
								aFilter.push(new Filter("Sequencia", FilterOperator.EQ, sSequencia));
							});
							var oModelHeaderPesagem = that.getView().getModel("headerPesagem");
							var oModelHeaderPesagemData = oModelHeaderPesagem.getData();

							if (!oModelHeaderPesagemData.TicketOrigem) {
								that._excluirItem(aFilter);
							} else {

								var table = that.getView().byId("tableItensPesagem");
								var iSelectedIndex = table.getSelectedIndex();
								var oModel = that.getView().getModel("itensPesagem");
								var aItensPesagem = oModel.getData();
								oModelHeaderPesagemData.Peso_Pallet = oModelHeaderPesagemData.Peso_Pallet -
									aItensPesagem[iSelectedIndex].PesoBruto;

								aItensPesagem.splice(iSelectedIndex, 1);

								//										$.each(oDataPesagem.results, function(index,item){
								//				            			 aItensPesagem.push(new ItensPesagem(item));
								//			            		 });
								var oModelItensPesagem = new JSONModel(aItensPesagem);
								that.getView().setModel(oModelItensPesagem, "itensPesagem");
								oModelHeaderPesagem = new JSONModel(oModelHeaderPesagemData);
								that.getView().setModel(oModelHeaderPesagem, "headerPesagem");

								debugger
								that._calculaTotais();

							}
						}
					}),
					new sap.m.Button({
						icon: "sap-icon://decline",
						text: this.getResourceBundle().getText("labelFechar")
					})
				],
				placement: sap.m.PlacementType.Bottom,
				cancelButtonPress: function () {
					that._oActionSheet.destroy(true);
				},
				afterClose: function () {
					var table = that.getView().byId("tableItensPesagem");
					var iTotRows = that.getView().getModel("itensPesagem").getData().length - 1;
					table.removeSelectionInterval(0, iTotRows);
					that._oActionSheet.destroy(true);
				}
			});
			//}

			this._oActionSheet.openBy(oButton);
		},

		handleDialogQtdCancelButton: function (oControlEvent) {
			this._oDialogQtd.close();
		},

		handleDialogCodBarrasCancelButton: function (oControlEvent) {
			this._oDialogCodBarras.close();
			debugger;
			var oModelHeaderPesagem = this.getView().getModel("headerPesagem");
			if (oModelHeaderPesagem) {
				var oModelHeaderPesagemData = oModelHeaderPesagem.getData();
				if (!oModelHeaderPesagemData.Pallet) {
					this._oBtnNovaPesagem.setVisible(true);
					this._oBtnDesmembPalete.setVisible(true);
					this._oBtnPesarDiferenca.setVisible(true);
				}
			} else {
				this._oBtnNovaPesagem.setVisible(true);
				this._oBtnDesmembPalete.setVisible(true);
				this._oBtnPesarDiferenca.setVisible(true);
			}

			//this._oTxtPesoTotal.setValue("");
		},

		handlePdfFormularioA4: function () {

			var that = this;
			var aFilters = [];
			var oModel = this.getView().getModel();

			aFilters.push(new Filter("Aufnr", FilterOperator.EQ, this._oOrdem.getValue()));
			aFilters.push(new Filter("Pallet", FilterOperator.EQ, this._sPallet));

			oModel.read("/ZSTPP_FORMULARIO_A4_URLSet", {
				filters: aFilters,
				async: false,
				success: function (oData, oResponse) {
					if (oData.results.length === 0) {
						that.messageAlert(that.getResourceBundle().getText("alertErroPdf"));
					} else {
						var sUrl = oData.results[0].Url;
						// var oPdf = {url : sUrl, title : "Formulário A4"};

						var oUrl = {
							url: sUrl
						};
						var oModel = new sap.ui.model.json.JSONModel(oUrl);
						sap.ui.getCore().setModel(oModel, "url");
						var oRouter = that.getRouter();
						oRouter.navTo("pdfFormularioA4");

						//		            	     var oModelPdf = new JSONModel(oPdf);
						//	            			 that.getView().setModel(oModelPdf, "pdf");	 
						//		            		
						//	            			 if (!that._oDialogPdfRomaneio) {
						//	            				 that._oDialogPdfRomaneio = sap.ui.xmlfragment("agile.pesagembobina.view.PdfRomaneio", that);
						//	            			 }
						//	            			 
						//	            			 that._oDialogPdfRomaneio.setModel(that.getView().getModel("pdf"),"pdf");
						//
						//	            			 that._oDialogPdfRomaneio.open();

					}
				}
			});

		},

		handlePdfFichaPallet: function () {

			var that = this;
			var aFilters = [];
			var oModel = this.getView().getModel();

			aFilters.push(new Filter("Aufnr", FilterOperator.EQ, this._oOrdem.getValue()));
			aFilters.push(new Filter("Pallet", FilterOperator.EQ, this._sPallet));

			oModel.read("/ZSTPP_FICHA_PALLET_URLSet", {
				filters: aFilters,
				async: false,
				success: function (oData, oResponse) {
					if (oData.results.length === 0) {
						that.messageAlert(that.getResourceBundle().getText("alertErroPdf"));
					} else {
						var sUrl = oData.results[0].Url;
						// var oPdf = {url : sUrl, title : "Formulário A4"};

						var oUrl = {
							url: sUrl
						};
						var oModel = new sap.ui.model.json.JSONModel(oUrl);
						sap.ui.getCore().setModel(oModel, "url");
						var oRouter = that.getRouter();
						oRouter.navTo("pdfFichaPallet");

						//		            	     var oModelPdf = new JSONModel(oPdf);
						//	            			 that.getView().setModel(oModelPdf, "pdf");	 
						//		            		
						//	            			 if (!that._oDialogPdfRomaneio) {
						//	            				 that._oDialogPdfRomaneio = sap.ui.xmlfragment("agile.pesagembobina.view.PdfRomaneio", that);
						//	            			 }
						//	            			 
						//	            			 that._oDialogPdfRomaneio.setModel(that.getView().getModel("pdf"),"pdf");
						//
						//	            			 that._oDialogPdfRomaneio.open();

					}
				}
			});

		},

		handleImprimirTodasEtiquetas: function () {
			var that = this;
			//				this._oPrinterHandler = new PrinterHandler(this);
			//				this._oPrinterHandler.handleSetupPrint();

			//				setTimeout(function(){ 
			var aFilter = [];

			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, that._oOrdem.getValue()));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, that._sPallet));

			that._imprimirEtiquetaPacote(aFilter);
			//				}, 3000);
		},

		handlePdfRomaneio: function () {

			var that = this;
			var aFilters = [];
			var oModel = this.getView().getModel();

			aFilters.push(new Filter("Aufnr", FilterOperator.EQ, this._oOrdem.getValue()));
			aFilters.push(new Filter("Pallet", FilterOperator.EQ, this._sPallet));
			debugger
			oModel.read("/ZSTPP_PACKING_LIST_URLSet", {
				filters: aFilters,
				async: false,
				success: function (oData, oResponse) {
					if (oData.results.length === 0) {
						that.messageAlert(that.getResourceBundle().getText("alertErroPdf"));
					} else {
						var sUrl = oData.results[0].Url;

						// var oPdf = {url : sUrl,  title : "Romaneio"};

						var oUrl = {
							url: sUrl
						};
						var oModel = new sap.ui.model.json.JSONModel(oUrl);
						sap.ui.getCore().setModel(oModel, "url");
						var oRouter = that.getRouter();
						oRouter.navTo("pdfRomaneio");

						//		            	     var oModelPdf = new JSONModel(oPdf);
						//	            			 that.getView().setModel(oModelPdf, "pdf");	 
						//		            		
						//	            			 if (!that._oDialogPdfRomaneio) {
						//	            				 that._oDialogPdfRomaneio = sap.ui.xmlfragment("agile.pesagembobina.view.PdfRomaneio", that);
						//	            			 }
						//	            			 
						//	            			 that._oDialogPdfRomaneio.setModel(that.getView().getModel("pdf"),"pdf");
						//
						//	            			 that._oDialogPdfRomaneio.open();

					}
				}
			});

		},

		handleDialogRomaneioCloseButton: function (oControlEvent) {
			this._oDialogPdfRomaneio.close();
		},

		handleSubmitQtd: function () {

			var that = this;

			var oQtd = sap.ui.getCore().byId("txtQtd");
			var sQtd = oQtd.getValue();

			var oQtdBobinas = sap.ui.getCore().byId("txtQtdBobinas");
			var sQtdBobinas = oQtdBobinas.getValue();

			if (sQtd != "" && sQtdBobinas != "") {
				debugger

				var oModelTotaisPesagem = that.getView().getModel("totaisPesagem");
				var oModelHeaderPesagem = that.getView().getModel("headerPesagem");

				if (oModelTotaisPesagem) {
					var oModelTotaisPesagemData = oModelTotaisPesagem.getData();
					var fTotBobinasPesadas = parseFloat(oModelTotaisPesagemData.TotalBobinasPesadas) + parseFloat(sQtdBobinas);

					//Se tiver atingido, salvo o ultimo item inserido e fecho a janela
					if (fTotBobinasPesadas > parseFloat(that._sTotPacotes)) {
						that.messageAlert(that.getResourceBundle().getText("alertQtdBobinasMaior"));
						this._oDialogQtd.close();
						return;
					}

					if (parseFloat(sQtdBobinas) > parseFloat(that._sTotPacotes)) {
						//fTotBobinasPesadas = "0";
						//oModelTotaisPesagemData.TotalBobinasPesadas = 0;
					}
				} else if (oModelHeaderPesagem) {
					var oModelHeaderPesagemData = oModelHeaderPesagem.getData();
					if (sQtdBobinas > oModelHeaderPesagemData.Max_linhas) {
						that.messageAlert(that.getResourceBundle().getText("alertQtdBobinasMaior"));
						this._oDialogQtd.close();
						return;
					}
				}

				if (sQtd <= 0) {
					that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoQuantidadeMenorIgualZero"));
				} else {
					that._buscaItensPesagem(that._sOrdem, that._sPallet, sQtd, sQtdBobinas);
					sap.ui.getCore().byId("txtQtd").setValue("");
					sap.ui.getCore().byId("txtQtdBobinas").setValue("");
					//that.leituraQtdDialog.close();
				}
			} else {
				that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoLeituraQuantidade"));
			}

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_limpaCamposQtd: function () {
			sap.ui.getCore().byId("txtQtd").setValue("");
			sap.ui.getCore().byId("txtQtdBobinas").setValue("");
		},

		_imprimirEtiquetaPacote: function (aFilter) {

			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var that = this;
			debugger
			oModel.read("/ZSTPP_PESAGEM_ETIQUETASet", {
				filters: aFilter,
				async: false,
				success: function (oDataEtiqueta, oResponseEtiqueta) {
					var message = oResponseEtiqueta.headers["my-custom-message"];
					if (message) {
						that.messageAlert(message);
						return;
					} else {
						var sCodZpl = "";

						$.each(oDataEtiqueta.results, function (index, item) {
							sCodZpl = item.CodZpl + " \n " + sCodZpl;
						});

						//		            		 that._oPrinterHandler.printData(sCodZpl);

						/*
						 * send to web socket app
						 * */
						var isHttps = window.location.protocol === "https:" ? true : false;
						var wSocket;
						if (isHttps) {
							wSocket = new WebSocket("wss://localhost:4649/Print");
						} else {
							wSocket = new WebSocket("ws://localhost:4648/Print");
						}

						wSocket.onopen = function (event) {
							wSocket.send(sCodZpl);
						};

						wSocket.onmessage = function (event) {
							if (event.data !== 'Success') {
								that.messageAlert(event.data);
							}
						};

						wSocket.onerror = function (event) {
							that.messageAlert("Ocorreu um erro na conexão");
						};
					}
				}
			});

		},

		_limpaCamposCodBarras: function () {
			this._oTxtCodBarras.setValue("");
			this._oTxtPesoAtual.setValue("");
			this._oTxtPesoTotal.setValue("");
			this._oBtnSalvarPesagem.setVisible(false);
			this.getView().setModel(null, "itensPesagemCache");
		},

		_lerPesoBalanca: function () {
			var vSwitch = sap.ui.getCore().byId("swtTipoPesagem");
			var valorSwitch = vSwitch.getState();
			var that = this;
			var fTotalPesoKg = 0
				//				return;
				//				data: { I_AUFNR : sAufnr,
				//						I_VORNR : sVornr}

			if (valorSwitch === true) {

				var oRequest = $.ajax({
					//url: "http://localhost/interfaceBalanca/balanca/LerPeso/TOLEDO 4800,E,7,2;1;6/2",
					//url: "http://localhost:55982/balanca/LerPeso/TOLEDO 4800,E,7,2;1;6/2",
					url: "https://localhost:443/interfaceBalanca/balanca/LerPeso/TOLEDO 4800,E,7,2;1;6/1",
					method: "POST"
						//crossDomain: false,
						//headers: {'X-Requested-With': 'XMLHttpRequest'},
						//async: false
				})

				oRequest.done(function (retorno) {

					that._sPesoBalancaAtual = parseFloat(retorno);

					if (parseFloat(that._sPesoBalancaAtual) > 0) {
						fTotalPesoKg = that._sPesoBalancaAtual / 100;

						if (fTotalPesoKg < 1000 && fTotalPesoKg != 0) {

							that._fPesoTotal += fTotalPesoKg;

							if (that._oTxtPesoAtual) {
								that._oTxtPesoAtual.setValue(fTotalPesoKg.toFixed(3));
								//that._oTxtPesoTotal.setValue(that._fPesoTotal.toFixed(3));
							}
						}
					} else if (parseFloat(that._sPesoBalancaAtual) == 0) {
						debugger;
						if (that._oTxtPesoAtual) {
							that._oTxtPesoAtual.setValue(fTotalPesoKg.toFixed(3));
							//that._oTxtPesoTotal.setValue(that._fPesoTotal.toFixed(3));
						}
					}

				});

				oRequest.fail(function (jqXHR, textStatus) {
					//debugger;
					//alert( "Error: " + jqXHR.status + " " + jqXHR.statusText);

				});
			};
		},

		_somarPesoTotal: function (fPesoAtual) {

			//var fPesoAtual = this._oTxtPesoAtual.getValue();

			if (this._oTxtPesoTotal.getValue() === "") {
				var fPesoTotal = 0;
			} else {
				var fPesoTotal = this._oTxtPesoTotal.getValue();
			}

			var fPesoTotalSoma = parseFloat(fPesoAtual) + parseFloat(fPesoTotal);
			this._oTxtPesoTotal.setValue(fPesoTotalSoma.toFixed(3));
		},

		_openLeituraQuantidade: function () {

			var that = this;

			if (!this._oDialogQtd) {
				this._oDialogQtd = sap.ui.xmlfragment("agile.pesagembobina.view.QtdDialog", this);
			}

			this._oDialogQtd.setModel(this.getView().getModel());
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogQtd);
			this._oDialogQtd.open();

			this._oTxtPesoAtual = sap.ui.getCore().byId("txtPesoAtualQtd");
			//this._oTxtPesoTotal = sap.ui.getCore().byId("txtPesoAtualQtd");
			//this._oBtnSalvarPesagem = sap.ui.getCore().byId("btnSalvarPesagemQtd");

			this._oTxtPesoAtual.setValue(that._sPesoBalancaAtual);

			/*var that = this;
				if (!that.leituraQtdDialog) {
					that.leituraQtdDialog = new Dialog({
						title: that.getResourceBundle().getText("titleLeituraQtd"),
						contentWidth: "150px",
						contentHeight: "100px",
						resizable: false,
						content: [new Input("txtQtd",{type:"Number", placeholder : "Quantidade"}),new Input("txtQtdBobinas",{type:"Number", placeholder : "Qtd. Bobinas"})],
						afterClose: function() {
							sap.ui.getCore().byId("txtQtd").setValue("");
							sap.ui.getCore().byId("txtQtdBobinas").setValue("");
						},
						beginButton: new Button({
							text: 'Confirmar',
							press: function () {
								
								var oQtd = sap.ui.getCore().byId("txtQtd");
								var sQtd = oQtd.getValue();
								
								var oQtdBobinas = sap.ui.getCore().byId("txtQtdBobinas");
								var sQtdBobinas = oQtdBobinas.getValue();
								
								if(sQtd != "" && sQtdBobinas != ""){

									var oModelTotaisPesagem = that.getView().getModel("totaisPesagem");
		            				 
		            				 if(oModelTotaisPesagem){
		            					 var oModelTotaisPesagemData = oModelTotaisPesagem.getData();
		            					 var fTotBobinasPesadas = parseFloat(oModelTotaisPesagemData.TotalBobinasPesadas) + parseFloat(sQtdBobinas);
		            					 
		            					 debugger
		            					 //Se tiver atingido, salvo o ultimo item inserido e fecho a janela
		            					 if(fTotBobinasPesadas > parseFloat(that._sTotPacotes) ){
		            						 that.messageAlert(that.getResourceBundle().getText("alertQtdBobinasMaior"));
		            						 return;
		            					 }
		            				 }
									
									that._buscaItensPesagem(that._sOrdem, that._sPallet, sQtd, sQtdBobinas);
									sap.ui.getCore().byId("txtQtd").setValue("");
									sap.ui.getCore().byId("txtQtdBobinas").setValue("");
									//that.leituraQtdDialog.close();
								}else{
									that.messageAlert(that.getResourceBundle().getText("alertPreenchimentoLeituraQuantidade"));
								}
								
							}
						}),
						endButton:  new Button({
							text: 'Cancelar',
							press: function () {
								that.leituraQtdDialog.close();
							}
						})
					
					});
	 
					//to get access to the global model
					this.getView().addDependent(that.leituraQtdDialog);
					
					that.leituraQtdDialog.open();
				}else{
					that.leituraQtdDialog.open();
				}*/

		},

		onChangeSwitchCodBarras: function () {

			var vSwitch = sap.ui.getCore().byId("swtTipoPesagem");
			var valorSwitch = vSwitch.getState();

			if (valorSwitch === true) {
				this._oTxtPesoAtual.setEnabled(false);
			} else {
				this._oTxtPesoAtual.setValue("");
				this._sPesoBalancaAtual = "";
				this._oTxtPesoAtual.setEnabled(true);
			}
		},

		onChangeSwitchCodBarrasQtd: function () {

			var vSwitch = sap.ui.getCore().byId("swtTipoPesagemQtd");
			var valorSwitch = vSwitch.getState();

			if (valorSwitch === true) {
				this._oTxtPesoAtual.setEnabled(false);
			} else {
				this._oTxtPesoAtual.setValue("");
				this._sPesoBalancaAtual = "";
				this._oTxtPesoAtual.setEnabled(true);
			}
		},

		_openLeituraCodBarras: function () {
			var that = this;

			if (!this._oDialogCodBarras) {
				this._oDialogCodBarras = sap.ui.xmlfragment("agile.pesagembobina.view.CodBarrasDialog", this);
			}

			this._oDialogCodBarras.setModel(this.getView().getModel());
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialogCodBarras.open();

			this._oTxtCodBarras = sap.ui.getCore().byId("txtCodigoBarras");
			this._oTxtPesoAtual = sap.ui.getCore().byId("txtPesoAtual");
			this._oTxtPesoTotal = sap.ui.getCore().byId("txtPesoTotal");
			this._oBtnSalvarPesagem = sap.ui.getCore().byId("btnSalvarPesagem");

			this._oTxtPesoAtual.setValue(that._sPesoBalancaAtual);

		},

		_verificarPosicaoSequenciaTabela: function () {

			var table = this.getView().byId("tableItensPesagem");
			var iTotRows = this.getView().getModel("itensPesagem").getData().length - 1;
			var iSelectedIndex = table.getSelectedIndex();

			//Verifica se foi selecionado o ultimo registro, pois só é permitido excluir a partir do ultimo
			if (iTotRows != iSelectedIndex) {
				return false;
			} else {
				return true;
			}

		},

		_excluirItem: function (aFilter) {

			if (this._verificarPosicaoSequenciaTabela() === false) {
				this.messageAlert(this.getResourceBundle().getText("labelAlertErroExclusao"));
				return;
			}

			//var aFilter = [];
			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var aItensPesagem = [];
			var that = this;

			var dialog = new Dialog({
				title: this.getResourceBundle().getText("titleConfirm"),
				type: 'Message',
				content: [
					new Text('confirmExcluirItem', {
						text: this.getResourceBundle().getText("messageConfirmExcluirItem")
					})
				],
				beginButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoConfirmar"),
					press: function () {
						oModel.read("/ZSTPP_PESAG_ITEMEXCLUIRSet", {
							filters: aFilter,
							async: false,
							success: function (oDataPesagem, oResponsePesagem) {

								if (oDataPesagem.results.length > 0) {

									$.each(oDataPesagem.results, function (index, item) {
										aItensPesagem.push(new ItensPesagem(item));
									});

									var oModelItensPesagem = new JSONModel(aItensPesagem);
									that.getView().setModel(oModelItensPesagem, "itensPesagem");

									that._calculaTotais();
								} else {
									var oModelItensPesagem = new JSONModel(new ItensPesagem());
									that.getView().setModel(oModelItensPesagem, "itensPesagem");
									that._calculaTotais();
								}

							}
						});

						dialog.close();
					}
				}),
				endButton: new Button({
					text: this.getResourceBundle().getText("labelBotaoCancelar"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		_limpaCamposTela: function () {
			var oHeaderPesagem = new HeaderPesagem();
			var oItensPesagem = new ItensPesagem();

			var oModelHeaderPesagem = new JSONModel(oHeaderPesagem);
			this.getView().setModel(oModelHeaderPesagem, "headerPesagem");

			var oModelItensPesagem = new JSONModel([oItensPesagem]);
			this.getView().setModel(oModelItensPesagem, "itensPesagem");

			this._oBtnRedefinirTara.setVisible(false);

			//this.messageToastAlert(this.getResourceBundle().getText("labelAlertSalvar"));

			var oModelTotaisPesagem = new JSONModel(new TotaisPesagem());
			this.getView().setModel(oModelTotaisPesagem, "totaisPesagem");

			this._sTpUnidadeMedida = "";
			this._sOrdem = "";
			this._sPallet = "";
			this._sNre = "";
			this._sDescNre = "";
			this._sTicketOrigem = "";

			this._oBtnNovaPesagem.setVisible(true);
			this._oBtnFinalizarPallet.setVisible(false);
			this._oBtnDesmembPalete.setVisible(true);
			this._oBtnPesarDiferenca.setVisible(true);
			this._oBtnSalvar.setVisible(false);
			this._oBtnCancelar.setVisible(false);
			this._oBtnPesagem.setEnabled(true);
			this._oBtnRomaneio.setVisible(false);
			this._oBtnFormularioA4.setVisible(false);
			this._oBtnFichaPallet.setVisible(false);
			this._oBtnImprimirEtiquetas.setVisible(false);
			this._oNre.setEnabled(true);

			this._oTara.setEnabled(true);
			this._oBtnRedefinirTara.setEnabled(true);

		},

		_SaveDifDesmemb: function () {

			var that = this;
			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var oModelItem = that.getView().getModel("itensPesagem");
			var oModelHeader = that.getView().getModel("headerPesagem");
			var aHeaderPesagem = oModelHeader.getData();
			var aItensPesagem = oModelItem.getData();
			var listBatch = {};

			listBatch.Aufnr = aHeaderPesagem.Aufnr;
			listBatch.Pallet = aHeaderPesagem.Pallet;
			listBatch.Peso_Pallet = String(aHeaderPesagem.Peso_Pallet);
			listBatch.Nlenr = aHeaderPesagem.Nlenr;
			listBatch.Nre = aHeaderPesagem.Nre;
			listBatch.TicketOrigem = aHeaderPesagem.TicketOrigem;
			listBatch.Difdesmemb = true;
			listBatch.DifSimNao = aHeaderPesagem.DifSimNao;
			listBatch.CABtoITEM = aItensPesagem;

			oModel.create("/SAVE_DESM_CABSet", listBatch, {
				success: function (oDataPesagem, oResponsePesagem) {
					var message = oResponsePesagem.headers["my-custom-message"];
					if (message) {
						that.messageAlert(message);
					} else {
						debugger;
						that._sOrdem = oDataPesagem.Aufnr;
						that._sPallet = oDataPesagem.Pallet;
						that._recuperarDadosOrdem(that._sOrdem, that._sPallet);

						that.messageToastAlert(that.getResourceBundle().getText("labelAlertSalvar"));
						/* that._oBtnRedefinirTara.setVisible(false);
				            	 that._oBtnCancelar.setVisible(false);
				            	 that._oBtnSalvar.setVisible(false);
				            	 that._oBtnNovaPesagem.setVisible(true);
				            	 that._oBtnFinalizarPallet.setVisible(false);
				            	 that._oBtnDesmembPalete.setVisible(false); 
				            	 that._oBtnPesarDiferenca.setVisible(false); 
				            	 that._oBtnPesagem.setEnabled(false);
				            	 that._oBtnRomaneio.setVisible(true);
				            	 that._oBtnFormularioA4.setVisible(true);
				            	 that._oBtnFichaPallet.setVisible(true);
				            	 that._oBtnImprimirEtiquetas.setVisible(true);*/
						if (that._oDialogPesoPallet) {
							that._oDialogPesoPallet.close();
						}
					}
				},
				error: function (err) {
					debugger;
					//that.messageToastAlert(oError);
					//Error Callback
					that._sOrdem = err.response.headers.aufnr;
					that._sPallet = err.response.headers.pallet;
					if (that._sPallet) {
						that._validaLockTicket(that._sOrdem, that._sPallet);
						that._recuperarDadosOrdem(that._sOrdem, that._sPallet);
					}
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show((JSON.parse(err.response.body).error.message.value));
				}

			});

		},

		_recuperarDadosOrdem: function (sOrdem, sPallet) {

			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var filter = [];
			var that = this;
			that._fOldOrdem = this._sOrdem;
			that._fOldPallet = this._sPallet;
			var sEfetivada;

			filter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			filter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_CABRECUPERARSet", {
				filters: filter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {

					that._sOrdem = oDataPesagem.results[0].Aufnr;
					that._sPallet = oDataPesagem.results[0].Pallet;
					that._sEfetivada = oDataPesagem.results[0].Efetivada;
					that._sDifdesmemb = oDataPesagem.results[0].Difdesmemb;
					that._sTotPacotes = oDataPesagem.results[0].Max_linhas;
					that._sTpUnidadeMedida = oDataPesagem.results[0].Gmein;
					that._sMsg = oDataPesagem.results[0].MsgErro;
					that._sPesoPallet = oDataPesagem.results[0].Peso_Pallet;
					that._sNre = oDataPesagem.results[0].Nre;
					that._sDescNre = oDataPesagem.results[0].DescNre;
					if (that._sOrdem === "" && that._sMsg === "") {
						that.messageAlert(that.getResourceBundle().getText("alertNenhumResultado"));
					} else if (that._sMsg) {
						that.messageAlert(that._sMsg);
					} else {
						var oModelHeaderPesagem = new JSONModel(new HeaderPesagem(oDataPesagem.results[0]));
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
						that._recuperaItensPesagem(that._sOrdem, that._sPallet, that._sEfetivada, that._sPesoPallet, that._sDifdesmemb);
						that._validaLockTicket(that._fOldOrdem, that._fOldPallet);
					}
				}
			});

		},

		_recuperarDadosDesmemb: function (sPallet) {

			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var filter = [];
			var that = this;
			that._fOldPallet = sPallet;
			var sEfetivada;

			filter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_DESMEMB_CABset", {
				filters: filter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					debugger;
					that._sOrdem = oDataPesagem.results[0].Aufnr;
					that._sPallet = oDataPesagem.results[0].Pallet;
					that._sEfetivada = oDataPesagem.results[0].Efetivada;
					that._sDifdesmemb = oDataPesagem.results[0].Difdesmemb;
					that._sTotPacotes = oDataPesagem.results[0].Max_linhas;
					that._sTpUnidadeMedida = oDataPesagem.results[0].Gmein;
					that._sMsg = oDataPesagem.results[0].MsgErro;
					that._sPesoPallet = oDataPesagem.results[0].Peso_Pallet;
					that._sNre = oDataPesagem.results[0].Nre;
					that._sDescNre = oDataPesagem.results[0].DescNre;
					that._sTicketOrigem = oDataPesagem.results[0].TicketOrigem;

					if (that._sOrdem === "" && that._sMsg === "") {
						that.messageAlert(that.getResourceBundle().getText("alertNenhumResultado"));
					} else if (that._sMsg) {
						that.messageAlert(that._sMsg);
					} else {
						oDataPesagem.results[0].Desmembramento = 'X';
						var oModelHeaderPesagem = new JSONModel(new HeaderPesagem(oDataPesagem.results[0]));
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
						that._recuperaItensDesmemb(that._fOldPallet, that._sEfetivada, that._sPesoPallet, that._sDifdesmemb);
					}
				}
			});

		},

		_recuperarDadosDif: function (sPallet) {

			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var filter = [];
			var that = this;
			that._fOldPallet = sPallet;
			var sEfetivada;

			filter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_DIF_CABset", {
				filters: filter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {

					that._sOrdem = oDataPesagem.results[0].Aufnr;
					that._sPallet = oDataPesagem.results[0].Pallet;
					that._sEfetivada = oDataPesagem.results[0].Efetivada;
					that._sDifdesmemb = oDataPesagem.results[0].Difdesmemb;
					that._sTotPacotes = oDataPesagem.results[0].Max_linhas;
					that._sTpUnidadeMedida = oDataPesagem.results[0].Gmein;
					that._sMsg = oDataPesagem.results[0].MsgErro;
					that._sPesoPallet = oDataPesagem.results[0].Peso_Pallet;
					that._sNre = oDataPesagem.results[0].Nre;
					that._sDescNre = oDataPesagem.results[0].DescNre;
					that._sTicketOrigem = oDataPesagem.results[0].TicketOrigem;

					if (that._sOrdem === "" && that._sMsg === "") {
						that.messageAlert(that.getResourceBundle().getText("alertNenhumResultado"));
					} else if (that._sMsg) {
						that.messageAlert(that._sMsg);
					} else {
						oDataPesagem.results[0].Difdesmemb = 'X';
						var oModelHeaderPesagem = new JSONModel(new HeaderPesagem(oDataPesagem.results[0]));
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");
						that._recuperaItensDif(that._fOldPallet, that._sEfetivada, that._sPesoPallet, that._sDifdesmemb);
					}
				}
			});

		},
		_validaLockTicket: function (sOrdem, sPallet) {
			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var filter = [];
			var that = this;

			debugger;

			filter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			filter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PPESAG_CABLockSet", {
				filters: filter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {

				}
			});

		},

		_buscaDadosOrdem: function (sOrdem) {

			var url = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var filter = [];
			var fTara = this._oTara.getValue();
			var that = this;

			//				if(fTara === ""){
			//					this.messageAlert(that.getResourceBundle().getText("messagePreenchimentoTara"));
			//					this.resizableDialog.close();
			//					return;
			//				}

			if (fTara === "") {
				fTara = 0;
			}

			if (this._oOrdem.getValue() != "" && this._oPallet.getValue() != "") {
				this._buscaItensPesagem(this._oOrdem.getValue(), this._oPallet.getValue(), 0, 0);
			} else {
				filter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
				filter.push(new Filter("Tara", FilterOperator.EQ, fTara));

				oModel.read("/ZSTPP_PESAG_CABSet", {
					filters: filter,
					async: false,
					success: function (oDataPesagem, oResponsePesagem) {

						that._sOrdem = oDataPesagem.results[0].Aufnr;
						that._sPallet = oDataPesagem.results[0].Pallet;
						that._sNre = oDataPesagem.results[0].Nre;
						that._sDescNre = oDataPesagem.results[0].DescNre;
						that._sTotPacotes = oDataPesagem.results[0].Max_linhas;
						that._sTpUnidadeMedida = oDataPesagem.results[0].Gmein;
						//that._sNlenr = oDataPesagem.results[0].Nlenr;

						if (oDataPesagem.results[0].Pallet === "") {
							that.messageAlert(that.getResourceBundle().getText("messageOrdemInvalida"));
							that._limpaCamposTela();
							return
						}

						var oModelHeaderPesagem = new JSONModel(new HeaderPesagem(oDataPesagem.results[0]));
						that.getView().setModel(oModelHeaderPesagem, "headerPesagem");

						if (that._sTpUnidadeMedida === "KG") {
							//novo
							that._oBtnSalvarPesagem.setVisible(true);
							that._buscaItensPesagem(that._sOrdem, that._sPallet, 0, 0);

							that._oTara.setEnabled(true);
							that._oBtnRedefinirTara.setEnabled(true);
						} else {
							that._oDialogCodBarras.close();
							that._openLeituraQuantidade();
							that._oTimeoutPesoQtd = setInterval(function () {
								that._lerPesoBalanca();
							}, 1000);
							that._oTara.setEnabled(true);
							//that._oBtnRedefinirTara.setEnabled(true);
							//ADD CASSIO - VERIFICAR DE COLOCAR A BUSCA POR ITENS NESSE PONTO
							that._oBtnRedefinirTara.setVisible(true);
							that._oBtnCancelar.setVisible(true);
							that._oBtnSalvar.setVisible(true);
							that._oBtnNovaPesagem.setVisible(true);
							that._oBtnFinalizarPallet.setVisible(false);
							that._oBtnDesmembPalete.setVisible(false);
							that._oBtnPesarDiferenca.setVisible(false);
							that._oBtnRomaneio.setVisible(false);
							that._oBtnFormularioA4.setVisible(false);
							that._oBtnFichaPallet.setVisible(false);
							that._oBtnImprimirEtiquetas.setVisible(true);
							//FIM CASSIO
						}

					}
				});
			}

		},

		_buscaItensPesagem: function (sOrdem, sPallet, fQuant, fQtdeBobinas) {
			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;
			var sRepetirChamada;
			var sSobrepesoBobina;
			var sSobrepesoOP; //ADD CASSIO 14/02/2018
			var sTotal;
			//var fQtdeBobinas = 0;
			var fQuantTotal = 0;
			//var fQuant = 0;
			var fTara = 0;

			if (this._oTxtPesoAtual) {
				var fPesoAtual = this._oTxtPesoAtual.getValue();

				if (fPesoAtual === "") {
					fPesoAtual = 0;
				}
			} else {
				fPesoAtual = 0;
			}

			//INI ADD CASSIO 14/02/2018
			if (this._oTxtPesoTotal) {
				var fPesoTotalSoma = this._oTxtPesoTotal.getValue();

				if (fPesoTotalSoma === "") {
					fPesoTotalSoma = 0;
				}
			} else {
				fPesoTotalSoma = 0;
			}
			//FIM ADD CASSIO 14/02/2018
			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			var oModelItensPesagemCache = this.getView().getModel("itensPesagemCache");

			if (oModelItensPesagemCache) {
				var dataItensPesagem = oModelItensPesagemCache.getData()[0];
				//fPesoBruto = dataItensPesagem.PesoBruto;
				fQtdeBobinas = dataItensPesagem.QtdeBobinas;
				fQuantTotal = dataItensPesagem.QuantTotal;
				fQuant = dataItensPesagem.Quant;
				fTara = dataItensPesagem.Tara;
			}

			if (fTara == 0) {
				fTara = this._oTara.getValue();
			}

			aFilter.push(new Filter("PesoBruto", FilterOperator.EQ, fPesoAtual));
			aFilter.push(new Filter("QtdeBobinas", FilterOperator.EQ, fQtdeBobinas));
			aFilter.push(new Filter("QuantTotal", FilterOperator.EQ, fQuantTotal));
			aFilter.push(new Filter("Quant", FilterOperator.EQ, fQuant));
			aFilter.push(new Filter("Tara", FilterOperator.EQ, fTara));
			aFilter.push(new Filter("PesoTotalSoma", FilterOperator.EQ, fPesoTotalSoma)); //ADD CASSIO 14/02/2018

			debugger;
			oModel.read("/ZSTPP_PESAG_ITEMSet", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					debugger;
					if (oDataPesagem.results.length > 0) {
						//that._oTara.setEnabled(false);
						that._oBtnRedefinirTara.setVisible(true);
						that._oBtnCancelar.setVisible(true);
						that._oBtnSalvar.setVisible(true);
						that._oBtnNovaPesagem.setVisible(true);
						that._oBtnFinalizarPallet.setVisible(false);
						that._oBtnDesmembPalete.setVisible(false);
						that._oBtnPesarDiferenca.setVisible(false);
						that._oBtnRomaneio.setVisible(false);
						that._oBtnFormularioA4.setVisible(false);
						that._oBtnFichaPallet.setVisible(false);
						that._oBtnImprimirEtiquetas.setVisible(true);

						$.each(oDataPesagem.results, function (index, item) {
							aItensPesagem.push(new ItensPesagem(item));
							sRepetirChamada = item.RepetirChamada;
							sSobrepesoBobina = item.SobrepesoBobina;
							sSobrepesoOP = item.SobrepesoOrdem;

							that._fQtdeBobinasTotal = item.QtdeBobinas;
							that._fTaraTotal = item.Tara;

						});

						if (sSobrepesoBobina != "") {
							debugger;

							that.messageAlert(that.getResourceBundle().getText("messageSobrepeso"));
						}
						if (sSobrepesoOP != "") {
							debugger;

							that.messageAlert(that.getResourceBundle().getText("messageSobrepesoOP"));
						}
						if (sRepetirChamada === "") {

							that.getView().setModel(null, "itensPesagemCache");
							//Novo
							that._oBtnSalvarPesagem.setVisible(false);
							//Comentado para manter a tela de codigo de barras ou qtd aberta durante a pesagem
							//		            			 if(that.leituraQtdDialog){
							//		            				 that.leituraQtdDialog.close();
							//		            			 }
							//		            			 
							//		            			 if(that._oDialogCodBarras){
							//		            				 that._oDialogCodBarras.close();
							//		            			 }

							if (sSobrepesoBobina === "" && sSobrepesoOP === "") {
								that._somarPesoTotal(fPesoAtual);
							}

							if (that._sTpUnidadeMedida === "KG") {
								that._salvarItemPesagem(sOrdem, sPallet, that._fQtdeBobinasTotal, that._fTaraTotal);
								that._limpaCamposCodBarras();
							} else {
								var oModelItensPesagem = new JSONModel(aItensPesagem);
								that.getView().setModel(oModelItensPesagem, "itensPesagem");
								that._calculaTotais();
								that._oDialogQtd.close();
							}

						} else {
							that._oBtnSalvarPesagem.setVisible(true);
							var oModelItensPesagem = new JSONModel(aItensPesagem);
							that.getView().setModel(oModelItensPesagem, "itensPesagemCache");
							that._oTxtCodBarras.setValue("");
							if (sSobrepesoBobina === "" && sSobrepesoOP === "") {
								that._somarPesoTotal(fPesoAtual);

								//verifica se já atingiu o total maximo de bobinas durante a pesagem
								var oModelTotaisPesagem = that.getView().getModel("totaisPesagem");

								if (oModelTotaisPesagem) {
									var oModelTotaisPesagemData = oModelTotaisPesagem.getData();
									var fTotBobinasPesadas = parseFloat(oModelTotaisPesagemData.TotalBobinasPesadas) + 1;

									//Se tiver atingido, salvo o ultimo item inserido e fecho a janela
									if (fTotBobinasPesadas === parseFloat(that._sTotPacotes) && that._sTpUnidadeMedida === "KG") {
										that.handleSalvarItemPesagem();
										that.messageAlert(that.getResourceBundle().getText("alertNumeroMaxBobinas"));
									}
								}
							}
						}
					} else {
						if (that.leituraQtdDialog) {
							that.leituraQtdDialog.close();
						}

						if (that._oDialogCodBarras) {
							that._oDialogCodBarras.close();
						}
						that.messageAlert(that.getResourceBundle().getText("alertNenhumResultado"));
						that._limpaCamposTela();
					}
				}
			});
		},

		_salvarItemPesagem: function (sOrdem, sPallet, fQtdeBobinas, fTara) {

			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;
			var sRepetirChamada;
			var sSobrepesoBobina;
			var sSobrepesoOP; //ADD CASSIO 14/02/018
			var sTotal;
			var fQuantTotal = 0;
			var fPesoTotal = this._oTxtPesoTotal.getValue();

			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));
			aFilter.push(new Filter("PesoBruto", FilterOperator.EQ, fPesoTotal));
			aFilter.push(new Filter("QtdeBobinas", FilterOperator.EQ, fQtdeBobinas));
			aFilter.push(new Filter("Tara", FilterOperator.EQ, fTara));

			debugger;
			oModel.read("/ZSTPP_PESAG_ITEMSALVARSet", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					debugger;
					if (oDataPesagem.results.length > 0) {
						//that._oTara.setEnabled(false);
						that._oBtnRedefinirTara.setVisible(true);
						that._oBtnCancelar.setVisible(true);
						that._oBtnSalvar.setVisible(true);
						that._oBtnNovaPesagem.setVisible(true);
						that._oBtnFinalizarPallet.setVisible(false);
						that._oBtnDesmembPalete.setVisible(false);
						that._oBtnPesarDiferenca.setVisible(false);
						that._oBtnRomaneio.setVisible(false);
						that._oBtnFormularioA4.setVisible(false);
						that._oBtnFichaPallet.setVisible(false);
						that._oBtnImprimirEtiquetas.setVisible(true);

						$.each(oDataPesagem.results, function (index, item) {
							aItensPesagem.push(new ItensPesagem(item));
						});

						var oModelItensPesagem = new JSONModel(aItensPesagem);
						that.getView().setModel(oModelItensPesagem, "itensPesagem");
						that._calculaTotais();

					} else {
						if (that.leituraQtdDialog) {
							that.leituraQtdDialog.close();
						}

						if (that._oDialogCodBarras) {
							that._oDialogCodBarras.close();
						}
						that.messageAlert(that.getResourceBundle().getText("alertNenhumResultado"));
						that._limpaCamposTela();
					}

				}
			});

		},

		_calculaTotais: function () {

			var oModelItensPesagem = this.getView().getModel("itensPesagem");
			var oModelTotalPesagem = {};
			var fCountPesoBruto = 0;
			var fCountPesoLiquido = 0;
			var fCountQtd = 0;
			var fCountQtdTotal = 0;
			var fTotBobinasPesadas = 0;
			//var fTotPacotesPesados = oModelItensPesagem.getData().length;
			debugger
			$.each(oModelItensPesagem.getData(), function (index, item) {
				fCountPesoBruto += parseFloat(item.PesoBruto);
				fCountPesoLiquido += parseFloat(item.PesoLiquido);
				fCountQtd += parseFloat(item.Quant);
				fCountQtdTotal += parseFloat(item.QuantTotal);
				fTotBobinasPesadas += parseFloat(item.QtdeBobinas);
			});

			oModelTotalPesagem.PesoBrutoTotal = fCountPesoBruto.toFixed(3);
			oModelTotalPesagem.PesoLiquidoTotal = fCountPesoLiquido.toFixed(3);
			oModelTotalPesagem.QuantidadeTotal = fCountQtd.toFixed(3);
			oModelTotalPesagem.TotalGeral = fCountQtdTotal.toFixed(3);
			oModelTotalPesagem.TotalMaximoPacotes = this._sTotPacotes;
			oModelTotalPesagem.TotalBobinasPesadas = fTotBobinasPesadas;

			//				if(fTotPacotesPesados === parseFloat(this._sTotPacotes)){
			//					this._oBtnPesagem.setEnabled(false);		            				 
			//				}else{
			//					this._oBtnPesagem.setEnabled(true);
			//				}

			if (fTotBobinasPesadas === parseFloat(this._sTotPacotes)) {
				this._oBtnPesagem.setEnabled(false);

				if (this.leituraQtdDialog) {
					this.leituraQtdDialog.close();
				}

				if (this._oDialogCodBarras) {
					this._oDialogCodBarras.close();
				}

			} else {
				this._oBtnPesagem.setEnabled(true);
			}

			var oModelTotaisPesagem = new JSONModel(new TotaisPesagem(oModelTotalPesagem));
			this.getView().setModel(oModelTotaisPesagem, "totaisPesagem");

		},

		_recuperaItensDesmemb: function (sPallet, sEfetivada, sPesoPallet) {
			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;
			var sRepetirChamada;

			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_DESMEMB_ITEMset", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					if (oDataPesagem.results.length > 0) {
						$.each(oDataPesagem.results, function (index, item) {
							aItensPesagem.push(new ItensPesagem(item));
						});

						var oModelItensPesagem = new JSONModel(aItensPesagem);
						that.getView().setModel(oModelItensPesagem, "itensPesagem");

						that._calculaTotais();
						that._oBtnRedefinirTara.setVisible(false);
						that._oNre.setEnabled(true);
						that._oBtnCancelar.setVisible(false);
						that._oBtnSalvar.setVisible(true);
						that._oBtnNovaPesagem.setVisible(true);
						that._oBtnFinalizarPallet.setVisible(false);
						that._oBtnDesmembPalete.setVisible(false);
						that._oBtnPesarDiferenca.setVisible(false);
						that._oBtnPesagem.setEnabled(false);
						that._oBtnRomaneio.setVisible(false);
						that._oBtnFormularioA4.setVisible(false);
						that._oBtnFichaPallet.setVisible(false);
						that._oBtnImprimirEtiquetas.setVisible(false);

						//that.resizableDialog.close();
					} else {
						that.getView().setModel(null, "itensPesagem");
					}

				}
			});

		},

		_recuperaItensDif: function (sPallet, sEfetivada, sPesoPallet) {
			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;
			var sRepetirChamada;

			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_DIF_ITEMset", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					if (oDataPesagem.results.length > 0) {
						$.each(oDataPesagem.results, function (index, item) {
							aItensPesagem.push(new ItensPesagem(item));
						});

						var oModelItensPesagem = new JSONModel(aItensPesagem);
						that.getView().setModel(oModelItensPesagem, "itensPesagem");

						that._calculaTotais();
						that._oBtnRedefinirTara.setVisible(false);
						that._oNre.setEnabled(true);
						that._oBtnCancelar.setVisible(false);
						that._oBtnSalvar.setVisible(true);
						that._oBtnNovaPesagem.setVisible(true);
						that._oBtnFinalizarPallet.setVisible(false);
						that._oBtnDesmembPalete.setVisible(false);
						that._oBtnPesarDiferenca.setVisible(false);
						that._oBtnPesagem.setEnabled(false);
						that._oBtnRomaneio.setVisible(false);
						that._oBtnFormularioA4.setVisible(false);
						that._oBtnFichaPallet.setVisible(false);
						that._oBtnImprimirEtiquetas.setVisible(false);

						//that.resizableDialog.close();
					} else {
						that.getView().setModel(null, "itensPesagem");
					}

				}
			});

		},

		_recuperaItensPesagem: function (sOrdem, sPallet, sEfetivada, sPesoPallet) {
			var sUrl = this.getUrlOdata();
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			var aFilter = [];
			var aItensPesagem = [];
			var that = this;
			var sRepetirChamada;

			aFilter.push(new Filter("Aufnr", FilterOperator.EQ, sOrdem));
			aFilter.push(new Filter("Pallet", FilterOperator.EQ, sPallet));

			oModel.read("/ZSTPP_PESAG_ITEMRECUPERARSet", {
				filters: aFilter,
				async: false,
				success: function (oDataPesagem, oResponsePesagem) {
					if (oDataPesagem.results.length > 0) {
						$.each(oDataPesagem.results, function (index, item) {
							aItensPesagem.push(new ItensPesagem(item));
						});

						var oModelItensPesagem = new JSONModel(aItensPesagem);
						that.getView().setModel(oModelItensPesagem, "itensPesagem");

						if (sEfetivada === "") {
							if (!that._sDifdesmemb) {
								that._oBtnRedefinirTara.setVisible(true);
								that._oBtnCancelar.setVisible(false);
								that._oBtnSalvar.setVisible(true);
								that._oBtnNovaPesagem.setVisible(true);
								that._oBtnFinalizarPallet.setVisible(false);
								that._oBtnDesmembPalete.setVisible(false);
								that._oBtnPesarDiferenca.setVisible(false);
								that._oBtnPesagem.setEnabled(true);
								that._oBtnRomaneio.setVisible(false);
								that._oBtnFormularioA4.setVisible(false);
								that._oBtnFichaPallet.setVisible(false);
								that._oBtnImprimirEtiquetas.setVisible(true);
								that._oNre.setEnabled(true);
								that._calculaTotais();
							} else {
								that._oBtnRedefinirTara.setVisible(false);
								that._oBtnCancelar.setVisible(false);
								that._oBtnSalvar.setVisible(true);
								that._oBtnNovaPesagem.setVisible(true);
								that._oBtnFinalizarPallet.setVisible(false);
								that._oBtnDesmembPalete.setVisible(false);
								that._oBtnPesarDiferenca.setVisible(false);
								that._oBtnPesagem.setEnabled(false);
								that._oBtnRomaneio.setVisible(false);
								that._oBtnFormularioA4.setVisible(false);
								that._oBtnFichaPallet.setVisible(false);
								that._oBtnImprimirEtiquetas.setVisible(false);
								that._oNre.setEnabled(true);
								that._calculaTotais();
							}
						} else {

							that._calculaTotais();
							that._oNre.setEnabled(false);
							that._oBtnRedefinirTara.setVisible(false);
							that._oBtnCancelar.setVisible(false);
							that._oBtnSalvar.setVisible(false);
							that._oBtnNovaPesagem.setVisible(true);
							that._oBtnFinalizarPallet.setVisible(true);
							that._oBtnDesmembPalete.setVisible(false);
							that._oBtnPesarDiferenca.setVisible(false);
							that._oBtnPesagem.setEnabled(false);
							if (sPesoPallet > 0) {
								that._oBtnRomaneio.setVisible(true);
								that._oBtnFormularioA4.setVisible(true);
							} else {
								that._oBtnRomaneio.setVisible(false);
								that._oBtnFormularioA4.setVisible(false);
							}
							that._oBtnFichaPallet.setVisible(true);
							that._oBtnImprimirEtiquetas.setVisible(true);
						}

						//that.resizableDialog.close();
					} else {
						that.getView().setModel(null, "itensPesagem");
					}

				}
			});

		}

	});
});