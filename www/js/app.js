
var app = angular.module('starter', 
  ['ionic', 'starter.controllers', 'starter.services','google-maps', 'formlyIonic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  //acceder a configuracionde ionic
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle("center");

  $stateProvider
    .state('tab', {
      url: '/tab',
      abstract: true,//que sepa que NO es una PAGINA, para anidaciones de plantilla
      templateUrl: 'templates/tab.html'//donde se guarda la plantilla
    })

    // HEREDAD PLANTILLA tab.home  PUNTO
    .state('tab.mapa_bloqueos', {
      url: '/mapa_bloqueos',//   /tab/home   en realidad por herencia
      
      views: {
        'tab-mapa_bloqueos': {//la que indico en tab.html entro de <tab buttom
          templateUrl: 'templates/mapa_bloqueos.html',
          controller: 'MapBloqueosCtrl'
        }
      }

    })

    .state('tab.mapa_reporte', {
      url: '/mapa_reporte',//   /tab/home   en realidad por herencia
      views: {
        'tab-mapa_reporte': {//la que indico en tab.html entro de <tab buttom
          templateUrl: 'templates/mapa_reporte.html',
          controller: 'MapaReporteCtrl'
        }
      }
    })

    .state('tab.info', {
      url: '/info',//   /tab/home   en realidad por herencia
      views: {
        'info': {
          templateUrl: 'templates/info.html'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  // Si ninguno de los estados anteriores se corresponden, utilizar esto como el repliegue
  $urlRouterProvider.otherwise('/tab/mapa_reporte');

});

/* imagenes menor a 2208

  ionic platform add android 
  ionic resources --ion
  ionic resources --splash  

  ionic build android

*/

