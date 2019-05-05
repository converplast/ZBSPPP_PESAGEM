sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
	"use strict";
	return Object.extend("agile.pesagembobina.model.BobinasTotalPacote", {
		constructor: function(data) {
			if(data){
				this.qtdBobinaAtual = data.qtdBobinaAtual ;
				this.qtdBobinaAcumulado = data.qtdBobinaAcumulado ;
				this.qtdBobinasPesadas = data.qtdBobinasPesadas;
			}else{
				this.qtdBobinaAtual = 0 ;
				this.qtdBobinaAcumulado = 0 ;
				this.qtdBobinasPesadas = 0;
			}
	  }

  });

});