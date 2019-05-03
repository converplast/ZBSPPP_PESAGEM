sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
	"use strict";
	return Object.extend("agile.pesagembobina.model.Impressora", {
		constructor: function(key, descricao) {
			if(key != ""){
				this.key = key;
				this.descricao = descricao;

			}else{
				this.key = "";
				this.descricao = ""
			}
	  }

  });

});