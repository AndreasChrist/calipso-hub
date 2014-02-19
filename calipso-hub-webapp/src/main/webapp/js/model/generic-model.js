define([ 'backbone', 'backgrid' ], 
function(Backbone, Backgrid) {
	var GenericModel = Backbone.Model.extend({
		/**
		 * Prefer the collection URL if any for more specific CRUD, fallback to own otherwise 
		 */
		url: function() {
			console.log("GenericModel#url called ");
			var sUrl = this.collection	 ? _.result(this.collection, 'url') : _.result(this, 'urlRoot') || urlError();
			if (!this.isNew()) {
				sUrl + (base.charAt(sUrl.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
			}
			window.alert("GenericModel#url: "+sUrl);
			console.log("GenericModel#url: "+sUrl);
			return sUrl;
	    },
	    schemaComplete : function() {
			return {};
		},
	    schema : function(actionName) {
			// decide based on model persistence state if no action was given 
			if(!actionName){
				actionName = this.isNew() ? "create" : "update";
			}
			// the schema to build for the selected action 
			var schemaForAction = {};
			// get the complete schema to filter out from
			var schemaComplete = this.schemaComplete();
			console.log("GenericModel#schema actionName: "+actionName+", schemaComplete: "+schemaComplete);
			
			// for each property, select the appropriate schema entry for the given action
			var propertySchema;
			var propertySchemaForAction;
			for(var propertyName in schemaComplete) {
			    if(schemaComplete.hasOwnProperty(propertyName)) {
			    	propertySchema = schemaComplete[propertyName];
		    		
			    	// if a schema exists for the property
			    	if(propertySchema){
			    		// try obtaining a schema for the specific action 
		    			propertySchemaForAction = propertySchema[actionName];
		    			// support wild card entries
		    			if(!propertySchemaForAction){
		    				propertySchemaForAction = propertySchema["default"];
		    			}
		    			if(propertySchemaForAction){
		    				schemaForAction[propertyName] = propertySchemaForAction;
		    			}
		    		}
		    	}
			    	
		    	// reset
		    	propertySchema = false;
		    	propertySchemaForAction = false;
		    }
			console.log("GenericModel#schema schemaForAction: "+schemaForAction);
			return schemaForAction;
		},
//		url:  function () {
//			console.log("GenericModel#url");
//			var sUrl;
//			if(this.collection && this.collection.url){
//				sUrl = this.collection.get("url");
//				console.log("Using model's collection url: "+sUrl);
//			}
//			else{
//				sUrl = this.urlRoot;
//				console.log("Using model's own url: "+sUrl);
//			}
//			if(!this.isNew()){
//				sUrl = sUrl + this.get(this.idAttribute); 
//			}
//		},
//		
		initialize: function () {
		    Backbone.Model.prototype.initialize.apply(this, arguments);
		    var thisModel = this;
		    this.on("change", function (model, options) {
			    if (options && options.save === false) {
			    	return;
			    }
			    var sUrl = model.url+"/"+model.get("id");
			    //(base.charAt(sUrl.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
			    //model.save({}, {url: sUrl});
		    });
		},
			
//			save : function(attributes, options) {
//				console.log("Saving change, attributes: "+attributes+", options: "+options);
//				var result = Backbone.Model.prototype.save.call(this, attributes, options);
//				console.log("Saved change");
//			},
	
			// validation: {
			// },

		
		},

		// static members
		{
			
		}
	);
	GenericModel.prototype.getDefaultSchemaForGrid = function(){
		// TODO: infer based on defaults OR conditionally build the edit etc. button columns
	}
	console.log("GenericModel done");
	return GenericModel;
});