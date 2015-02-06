'use strict';

angular.module('tikrApp')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
	$urlRouterProvider.otherwise(function() {
      messageService.get('http://localhost:9000/pub/alexstg', console.log);
    });
  });
