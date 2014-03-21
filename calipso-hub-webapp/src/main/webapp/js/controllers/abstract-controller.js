/*
 * Copyright (c) 2007 - 2013 www.Abiss.gr
 *
 * This file is part of Calipso, a software platform by www.Abiss.gr.
 *
 * Calipso is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Calipso is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Calipso. If not, see http://www.gnu.org/licenses/agpl.html
 */
define(function(require) {
	var Backbone = require('backbone'),
	Marionette = require('marionette'),
	CalipsoApp = require('app'),
	session = require('session'),
	vent = require('vent'),
	AppLayoutView = require('view/AppLayoutView'),
	HomeView = require('view/HomeView'),
	NotFoundView = require('view/NotFoundView'),
	LoginView = require('view/LoginView'),
	MainContentNavView = require('view/MainContentNavView'),
	TabLayout = require('view/generic-crud-layout'),
	GenericCollectionGridView = require('view/generic-collection-grid-view'),
	GenericFormView = require('view/GenericFormView'),
	GenericCollection = require('collection/generic-collection'),
	GenericModel = require('model/generic-model'),
	GenericCollectionWrapperModel = require('model/generic-collection-wrapper-model'),
	LoginModel = require('model/LoginModel'),
	UserModel = require('model/user'),
	HostModel = require('model/host');


	var AbstractController = Marionette.Controller.extend({
		constructor: function(options){

			Marionette.Controller.prototype.constructor.call(this, options);
			if(options && options.layout){
				this.layout = options.layout;
			}
			else{
				this.layout = new AppLayoutView({
					model : session
				});
			}
			this.layout.on("show", function() {
				vent.trigger("layout:rendered");
			});

			vent.trigger('app:show', this.layout);

		},
		home : function() {

			if (!session.isAuthenticated()) {
				Backbone.history.navigate("client/login", {
					trigger : true
				});
				return false;
			}
			var homeView = new HomeView();
			_initializeLayout();
			MainController.layout.content.show(homeView);
		},

		login : function() {

			var loginModel = new LoginModel({
				email : session.get('email'),
				issuer : session.get('issuer')
			});

			var view = new LoginView({
				model : loginModel
			});

			view.on('app:login', AbstractController.authenticate);

			vent.trigger('app:show', view);
		},

		authenticate : function(args) {
//			console.log('MainController authenticate called');
			var self = this;
			var email = this.$('input[name="email"]').val();
			var password = this.$('input[name="password"]').val();

			$.when(this.model.authenticate(email, password)).then(function(model, response, options) {
				session.save(model);
				session.load();
//				console.log('MainController authenticate navigating to home');
				Backbone.history.navigate("client/home", {
					trigger : true
				});
			}, function(model, xhr, options) {
				self.$el.find('.alert').show();
			});
		},

		logout : function() {
			session.destroy();
			Backbone.history.navigate("client/login", {
				trigger : true
			});
		},
		notFoundRoute : function(path) {
//			console.log("notFoundRoute, path: "+path);
			this.layout.content.show(new NotFoundView());
		},
		mainNavigationCrudRoute : function(mainNavTabName, contentNavTabName) {

			this.tryExplicitRoute(mainNavTabName);
			var mainAreaChange = (mainNavTabName != this.lastMainNavTabName);

			// note last main nav tab
			if(!mainNavTabName){
				mainNavTabName = this.lastMainNavTabName;
			}
			if(!contentNavTabName){
				contentNavTabName = "Search";
			}
			

			// render generic model driven view
			var viewRoute = this.viewRoutes[mainNavTabName];
			var ModelClass = require(this.modelClasses[mainNavTabName]);
			var _self = this;
			console.log("AbstractController#mainNavigationCrudRoute, mainNavTabName: " + mainNavTabName + ", contentNavTabName: " + contentNavTabName);
			if (contentNavTabName == "Search"){
				if(mainAreaChange	){
					console.log("AbstractController#mainNavigationCrudRoute, updating this.searchResults");
					this.searchResults = new GenericCollection([], {
						model : ModelClass,
						url : CalipsoApp.getCalipsoAppBaseUrl() + viewRoute
					});
				}
				else{
					console.log("AbstractController#mainNavigationCrudRoute, updating NOT updated");
				}
				var searchResultsModel = new GenericCollectionWrapperModel({
					modelClass : ModelClass,
					wrappedCollection : this.searchResults
				});
				console.log("AbstractController#mainNavigationCrudRoute, searchResultsModel.get(name): "+
						searchResultsModel.get("name"));
				var TabModel      = Backbone.Model.extend();
				var TabCollection = Backbone.Collection.extend({ model: GenericModel });
	
				this.tabs = new TabCollection([
	            //(new HostModel({ name: 'foobar' })),
	            (searchResultsModel)      
	         ]);
	         var tabLayout = new TabLayout({collection: this.tabs});

	         vent.on("editItem", function(itemModel) {
	       	 	console.log("vent event editItem: "+itemModel.get("name"));
	       	 	Backbone.history.navigate("client/"+_self.lastMainNavTabName+"/"+itemModel.get("id"), {
						trigger : false
					});
	       	 	_self.tabs.add(itemModel);
	       	 	_self.syncMainNavigationState(null, itemModel.get("id"));
	         });
				// render view
				//_self.layout.mainContentNavRegion.show(tabLayout);
				this.layout.content.show(tabLayout);

				this.syncMainNavigationState(mainNavTabName, contentNavTabName);
			}

		},
		syncMainNavigationState : function(mainNavTabName, contentNavTabName) {
			console.log("AbstractController#syncMainNavigationState, mainNavTabName: " + mainNavTabName + ", contentNavTabName: "+contentNavTabName);
		// update active nav menu tab
			if(mainNavTabName && mainNavTabName != this.lastMainNavTabName){
				$('.navbar-nav li.active').removeClass('active');
				$('#mainNavigationTab-' + mainNavTabName).addClass('active');
				this.lastMainNavTabName = mainNavTabName;
			}
			// update active content tab
			if(contentNavTabName && contentNavTabName != this.lastContentNavTabName){
				$('#generic-crud-layout-tab-labels li.active').removeClass('active');
				$('#generic-crud-layout-tab-label-' + contentNavTabName).addClass('active');
				// show coressponding content
				$('.generic-crud-layout-tab-panel').addClass('hidden');
				$('#generic-crud-layout-tab-panel-' + contentNavTabName).removeClass('hidden');
				this.lastContentNavTabName = contentNavTabName;
			}
		},
		tryExplicitRoute : function(mainNavTabName){
			if(!mainNavTabName){
				mainNavTabName = "hosts";
			}
			else if (typeof this[mainNavTabName] == 'function') {
				// render explicit route
				this[mainNavTabName]();
			} 
		},
		mainNavigationRoute : function(mainNavTabName, contentNavTabName) {},

		editItem : function(item) {
			console.log("MainController#editItem, item: "+item);
		}
		

	});
	return AbstractController;
});
	