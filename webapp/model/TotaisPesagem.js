sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
	"use strict";
	return Object.extend("agile.pesagembobina.model.TotaisPesagem", {
		constructor: function(data) {
			if(data){
				this.PesoBrutoTotal = data.PesoBrutoTotal;
				this.PesoLiquidoTotal = data.PesoLiquidoTotal;
				this.QuantidadeTotal = data.QuantidadeTotal;
				this.TotalGeral = data.TotalGeral;
				this.TotalMaximoPacotes = data.TotalMaximoPacotes;
				this.TotalBobinasPesadas = data.TotalBobinasPesadas;
			}else{
				this.PesoBrutoTotal = "";
				this.PesoLiquidoTotal = "";
				this.QuantidadeTotal = "";
				this.TotalGeral = "";
				this.TotalMaximoPacotes = "";
				this.TotalBobinasPesadas = "";
			}
	  }

  });

});