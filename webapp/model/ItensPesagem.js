sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
	"use strict";
	return Object.extend("agile.pesagembobina.model.ItensPesagem", {
		constructor: function(data) {
			if(data){
				this.Pallet = data.Pallet;
				this.Aufnr = data.Aufnr;
				this.PesoBruto = data.PesoBruto;
				this.PesoLiquido = data.PesoLiquido;
				this.Tara = data.Tara;
				this.Quant = data.Quant;
				this.Sequencia = data.Sequencia;
				this.Pacote = data.Pacote;
				this.Gmein = data.Gmein;
				this.QtdeBobinas = data.QtdeBobinas;
				this.QuantTotal = data.QuantTotal;				
			}else{
				this.Pallet = "";
				this.Aufnr = "";
				this.PesoBruto = "";
				this.PesoLiquido = "";
				this.Tara = "";
				this.Quant = "";
				this.Sequencia = "";
				this.Pacote = "";
				this.Gmein = "";
				this.QtdeBobinas = "";
				this.QuantTotal = "";			
			}
	  }

  });

});