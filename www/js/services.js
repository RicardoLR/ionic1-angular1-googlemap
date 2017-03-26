angular.module('starter.services', [])


.factory('BloqueosServices', ['$http', '$q', function($http, $q) {
  

  var REST_SERVICE_URI = 'http://proyectos-mx.net/appbloqueos/web_bloqueos/';

  var factory = {
    fetchAllBloqueos: fetchAllBloqueos,
    createBloqueo: createBloqueo,
    deleteBloqueo: deleteBloqueo
  };

  return factory;


  function fetchAllBloqueos() {

    var mi_promesa = $q.defer();

    $http.get(REST_SERVICE_URI+'obtener_altitud_bloqueosPDO.php').then(
      
      function (response) {
        mi_promesa.resolve(response.data);
      },

      function(errResponse){
        console.error('Error while fetching Bloqueos');
        mi_promesa.reject(errResponse);
      }
    );
    
    return mi_promesa.promise;
  }

  function createBloqueo(bloqueo) {
    
    var deferred = $q.defer();
    
    $http.post(REST_SERVICE_URI+"insertar_bloqueo.php", {
        'reporteSend': reporteSend
      }).then(
      function (response) {
        deferred.resolve(response.data);
      },
      function(errResponse){
        console.error('Error while creating Bloqueo');
        deferred.reject(errResponse);
      }
    );

    return deferred.promise;
  }


  function deleteBloqueo(id) {

    var deferred = $q.defer();

    var reporteSend={
      "idEliminar":idEliminar
    }

    
    $http.post(REST_SERVICE_URI+'delete_id_bloqueo.php', {
      'reporteSend': reporteSend
    }).then(

      function (response) {
        deferred.resolve(response.data);
      },
      function(errResponse){
        console.error('Error while deleting Bloqueo');
        deferred.reject(errResponse);
      }
    );

    return deferred.promise;
  }



}]);
