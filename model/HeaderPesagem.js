sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
	"use strict";
	return Object.extend("agile.pesagembobina.model.HeaderPesagem", {
		constructor: function(data) {
			if(data){
				this.Pallet 		= data.Pallet;
				this.Aufnr 			= data.Aufnr;
				this.Werks 			= data.Werks;
				this.DescCentro 	= data.DescCentro;
				this.Plnbez 		= data.Plnbez;
				this.Maktx 			= data.Maktx;
				this.Kunnr 			= data.Kunnr;
				this.DescCliente 	= data.DescCliente;
				this.Tara 			= data.Tara;
				this.Modelo 		= data.Modelo;
				this.Useralias 		= data.Useralias;
				this.Uname 			= data.Uname;
				this.DtFabr 		= data.DtFabr;
				this.DtVal 			= data.DtVal;
				this.Efetivada 		= data.Efetivada;
				this.Gmein 			= data.Gmein;
				this.Max_linhas 	= data.Max_linhas;
				this.Peso_Pallet 	= data.Peso_Pallet;
				this.Nlenr 			= data.Nlenr;
				this.Nre   			= data.Nre;
				this.DescNre 		= data.DescNre;
				this.TicketOrigem 	= data.TicketOrigem;
				this.Desmembramento = data.Desmembramento;
				this.Difdesmemb		= data.Difdesmemb;
				this.DifSimNao		= data.DifSimNao;
			}else{
				this.Pallet 		= "";
				this.Aufnr 			= "";
				this.Werks 			= "";
				this.DescCentro 	= "";
				this.Plnbez 		= "";
				this.Maktx 			= "";
				this.Kunnr 			= "";
				this.DescCliente 	= "";
				this.Tara 			= "";
				this.Modelo 		= "";
				this.Useralias 		= "";
				this.Uname 			= "";
				this.DtFabr 		= "";
				this.DtVal 			= "";
				this.Gmein 			= "";
				this.Max_linhas 	= "";
				this.Efetivada 		= "";
				this.Peso_Pallet 	= "";
				this.Nlenr 			= "";
				this.Nre 			= "";
				this.DescNre 		= "";
				this.TicketOrigem 	= "";
				this.Desmembramento = "";
				this.Difdesmemb		= "";			
				this.DifSimNao		= "";
			}
	  }

  });

});