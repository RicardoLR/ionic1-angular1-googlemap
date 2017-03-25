
angular.module('starter.controllers', ['pickadate', 'ionic', 'ionic-datepicker', "ion-datetime-picker"])


/* GEOLOCALIZATION  
	cordova plugin add cordova-plugin-geolocation

	https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/index.html
	cordova -> plugin -> geolocation
	*/


//poner en mapa los BLOQUEOS como lineas de colores o puntos
//flujo http://gamingfactorystoryuami.site90.net/WebServicePhpAlertate/web/GeoJSON.php
.controller('MapBloqueosCtrl', ['$scope', '$http', '$state', function($scope, $http, $state) {


	var mapaDelic;
	var miPosicion;
	var latSendVar, lngSendVar;

	var markerCoordinates = [];
	var marker;
	var image = {
		url: 'img/icon_tianguis.png',
		// This marker is 20 pixels wide by 32 pixels high.
		size: new google.maps.Size(40, 64),
		origin: new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at (0, 32).
		anchor: new google.maps.Point(0, 32)
	};

	$scope.ver_por_filtroList = [
		{ text: "Todo", checked: false, value:1 },
		
		{ text: "Tipo de venta", checked: false, value:2 },
		{ text: "Delegacion", checked: false, value:3 },
		{ text: "Temporada", checked: false, value:4 },
		{ text: "Dias", checked: false, value:5 }
	];

	$scope.bloqueosList = [
		{ text: "Feria", checked: false, value:1 },
		{ text: "tianguis", checked: false, value:2 },
		{ text: "Fiesta Patronal", checked: false, value:3 },
		
		{ text: "Accidente", checked: false, value:10 },
		{ text: "Fuga de Sustancias Peligrosas", checked: false, value:11 },

		{ text: "Salida Escolar", checked: false, value:15 },
		{ text: "Cierre por Obras", checked: false, value:16 },
		{ text: "Marchas", checked: false, value:17 },
		{ text: "Inundacion", checked: false, value:18 }
	];

	google.maps.event.addDomListener(window, 'load', initMapBloqueos());

	function initMapBloqueos() {
		console.log("initMapBloqueos MapBloqueosCtrl");

		miPosicion = [];

		navigator.geolocation.getCurrentPosition(function(position){
			miPosicion.push(position.coords.latitude);
			miPosicion.push(position.coords.longitude);

			console.log("getCurrentPosition", miPosicion[0]);
		});

		var mapOptions = {
			// the Teide ;-)
			center: {lat: miPosicion[0], lng: miPosicion[1]},
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControlOptions: {
				mapTypeIds: []
			},
			panControl: false,
			streetViewControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			}
		};

		mapaDelic = new google.maps.Map(document.getElementById("mapaDelic"), mapOptions);
		

		$http.get('http://bloqueosviales.webcindario.com/web_bloques/obtener_altitud_bloqueosPDO.php')
			.success(function(data){//success() llamada AJAX

				//------ para arreglo tridimencional  con mongo  ------------------
				/*
				console.log(data.coordenadas[0][0][0], " ", data.coordenadas[0][0].length, " ", data.coordenadas[0].length, " ", data.coordenadas.length);
				console.log(data.coordenadas[0][0][1]);

				var poligonoCoordinates = {};

				// initialize your stack
				var myStack=[];
				var routes = [];

				for (i = 0; i < data.coordenadas.length; i++) { 
					for (j = 0; j < data.coordenadas[i].length; j++) { 


					console.log("valores:", i, " " , j, " ", data.coordenadas[i][j][0], " ", data.coordenadas[i][j][1]);
					
					routes.push(
						new google.maps.LatLng(data.coordenadas[i][j][0], data.coordenadas[i][j][1])
						);
					}
					myStack.push(routes);
					var polyline = new google.maps.Polyline({
					path: routes
					, map: mapaDelic
					, strokeColor: '#ff0000'
					, strokeWeight: 5
					, strokeOpacity: 0.8
					, clickable: false
				});
				
				polyline.setMap(mapaDelic);
				routes.splice(0, routes.length); 
				}*/

				//------ FIN para arreglo tridimencional  con mongo  ------------------

				console.log("cargando data", data[0].latitud);

				var poligonoCoordinates = {};

				// initialize your stack
				var myStack=[];
				var routes = [];

				for (i = 0; i < data.length; i++) { 

					//separamos en array las coordenadas y las ponemos en las rutas ROUTES					
					var latAssoc =  data[i].latitud.split(",");
					var lngAssoc =  data[i].longitud.split(",");

					for (j=0; j<latAssoc.length; j++) {
						routes.push(
							new google.maps.LatLng(latAssoc[j], lngAssoc[j])
							);
					} 
					var miStrokeColor; 
					if(data[i].tipo_bloqueo == 1)
						miStrokeColor = "#0000FF";
					else if(data[i].tipo_bloqueo == 2)
						miStrokeColor = "#FF0000";
					else if(data[i].tipo_bloqueo == 3)
						miStrokeColor = "#00FF00";
					else if(data[i].tipo_bloqueo == 10)
						miStrokeColor = "#FF00FF";
					else
						miStrokeColor = "#9400D3";


					myStack.push(routes);
					var polyline = new google.maps.Polyline({
						path: routes
						, map: mapaDelic
						, strokeColor: miStrokeColor
						, strokeWeight: 5
						, strokeOpacity: 0.8
						, clickable: true
					});
					
					polyline.setMap(mapaDelic);
					routes.splice(0, routes.length);

					var auxDescripcion = getTipoDelito( parseInt(data[i].tipo_bloqueo) );
					auxDescripcion = auxDescripcion +" "+ data[i].nombre_tianguis;
					var miTitle = data[i].dias+" de "+data[i].hora_inicial+"-"+data[i].hora_final + "</br>" +data[i].temp_inicial +" a "+data[i].temp_final+ "</br>" + data[i].delegacion+" "+data[i].calles;

					console.log("miTitle", miTitle);
					console.log("auxDescripcion", auxDescripcion);

					marker = new google.maps.Marker({
						position: new google.maps.LatLng( latAssoc[i], lngAssoc[i]),
						map: mapaDelic,
						title: miTitle,
						animation: google.maps.Animation.DROP,
						label:auxDescripcion,
						icon: image,
						visible:true
					});


					google.maps.event.addListener(marker, 'click', (function(marker, i) {
						return function() {
							//console.log(marker.getTitle(), " ", marker.getLabel() );

							document.getElementById("divMarker").innerHTML = 
								marker.getLabel()  + "<br>" + marker.getTitle();  // Agrego nueva linea antes

							//********** Marker SALTADOR ****************
							if (marker.getAnimation() !== null) {
								marker.setAnimation(null); //parar
							} else {
								marker.setAnimation(google.maps.Animation.BOUNCE);
								setTimeout(function(){
									marker.setAnimation(null);
								},2000,"JavaScript");	
							}

						}
					})(marker, i));
					
					//************************* eventos de polilinea   *************************************
					/*google.maps.event.addListener(polyline, 'click', (function(polyline, i) {
						return function() {
							console.log("mi polyline" );
							//********** polilinea que cambia de color 2 seg ****************
							polyline.setOptions({strokeColor:'#FF00FF'});

							setTimeout(function(){
								polyline.setOptions({strokeColor:"#FF00FF"});
							},2000,"JavaScript");	
						}
					})(polyline, i));*/
					//********************************************************************

					markerCoordinates.push(marker);
				}
				 
			});
		//------------------- pintar poligono en mapa --------
		/*var poligonoCoordinates = [
		{lat: 37.772, lng: -122.214},
		{lat: 21.291, lng: -157.821},
		{lat: -18.142, lng: 178.431},
		{lat: -27.467, lng: 153.027}
		];
		var flightPath = new google.maps.Polyline({
			path: poligonoCoordinates,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 5
		});

		flightPath.setMap(mapaDelic);*/
		//------------------- fin pintar poligono en mapa --------

		navigator.geolocation.getCurrentPosition(function(pos) {
			mapaDelic.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		
		/*	var marker = new google.maps.Marker({
				id: "some-id",
				icon: {
						strokeColor: "red"
				},
				map: mapaDelic,
				title: "Ejemplo de marker",
				position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
			});

			window.infowindow = new google.maps.InfoWindow({
				content: 'content'
			});

			//atrapar un evento al tocar marter
			google.maps.event.addListener(marker, 'mousedown', function(){
					alert("mensaje");
			});*/
		});


		//------- Este evento se activa cuando cambia la propiedad del centro de mapa.
		mapaDelic.addListener('center_changed', function() {
			latSendVar = mapaDelic.getCenter().lat();		  
			lngSendVar = mapaDelic.getCenter().lng();

			var geocoder = new google.maps.Geocoder;
			var infowindow = new google.maps.InfoWindow;

			geocodeLatLng(geocoder, mapaDelic, infowindow, new google.maps.LatLng( latSendVar, lngSendVar), "address");
		});

		$scope.mapaDelic = mapaDelic;
	}

	function getDibujaPolBloqueos(){

	}

	//regresa el texto a mostrar, recordar value empieza en 1 pero el arreglo en 0
	function getTipoDelito(value){
	
		//Valor i+1, arreglo i creciente no es uno menor
		switch(value) {
			case 1:
				return $scope.bloqueosList[0].text;
				break;
			case 2:
				return $scope.bloqueosList[1].text;
				break;
			case 3:
				return $scope.bloqueosList[2].text;
				break;

			case 10:
				return $scope.bloqueosList[3].text;
				break;
			case 11:
				return $scope.bloqueosList[4].text;
				break;

			case 15:
				return $scope.bloqueosList[5].text;
				break;		
			case 16:
				return $scope.bloqueosList[6].text;
				break;						
			case 17:
				return $scope.bloqueosList[7].text;
				break;
			case 18:
				return $scope.bloqueosList[8].text;
				break;

			default:
				return "Bloqueo";
		}
	}


	$scope.irPosActual = function(){
		mapaDelic.setCenter( new google.maps.LatLng( miPosicion[0], miPosicion[1] ) );				
	}

	//-------------  Direccion  --------------
	$scope.addAddress = function() {
		var geocoder = new google.maps.Geocoder();
		geocodeAddress(geocoder, mapaDelic);
	}
	function geocodeAddress(geocoder, resultsMap) {
			
		var address = document.getElementById('address').value;
		geocoder.geocode({'address': address}, function(results, status) {
			
			if (status === google.maps.GeocoderStatus.OK) {
				resultsMap.setCenter(results[0].geometry.location);


				/* iconoc personalozado */
				/*var image = 'images/beachflag.png';
				var markerDireccion = new google.maps.Marker({
					map: resultsMap,
					position: results[0].geometry.location,
					icon: image
				});*/
				//----------------------------

				var markerDireccion = new google.maps.Marker({
					map: resultsMap,
					position: results[0].geometry.location
			 });

				setTimeout(function(){
						markerDireccion.setMap(null);
				},2000,"JavaScript");

			} else {
				alert('Vuelva a escribir la direcciòn. gracias.');
			}
		});
	}

}])


.controller('MapaReporteCtrl', 
	['$scope', '$http', '$state', '$ionicModal', '$filter', '$location', '$cordovaSocialSharing',
	'$cordovaSQLite', '$ionicPopup', '$timeout',
	function($scope, $http, $state, $ionicModal, $filter, $location, $cordovaSocialSharing,
	 $cordovaSQLite, $ionicPopup, $timeout,
	 formlyConfig, $cordovaDatePicker, ionicDatePicker) { 

	var map;

	/*	=================================
		ng.hide Esconde cuando es TRUE 
		===================================  */	
	$scope.hideBotoneraRegistro = true;

	$scope.hideButtonRegresaPoligono = true;
	$scope.hideButtonCancelContinuo = true;
	$scope.hideButtonCancelPartes = true;
	
	$scope.hideButtonSigTramo = true;
	$scope.hideButtonSigViewUserAMano = true;
	
	$scope.hideButtonReportar = false;
	
	$scope.hideActualizaMapa = false;


	$scope.hideDias = true;
	$scope.hideTemporada = true;
	$scope.hideHoraInicio = true;
	$scope.hideHoraFin = true;

	$scope.showTipoVenta=true;
	$scope.showTemporada=true;

	$scope.nombre_tianguis="";

	/*	=================================
	variables de la hacia la vista modal reportando
	===================================  */	
	$scope.hora_inicial;
	$scope.hora_inicial;


	var polygon;
	var path;
	
	var posArrayPathPintadoMapa = 0;
	var arrayDePolygon = []; 
	var arrayDePath = [];
	var arrayMarker = [];
	var posMarker;
	var miPosicion;

	var latSendVar, lngSendVar;

	//servira para tener refrencia de todos las polilineas
	var polygonArray = [];
	//Markers que se dibujarn en el mapa y el array con todos ellos
	var markerCoordinates = [];
	var marker;

	var image = {
		url: 'img/icon_tianguis.png',
		// This marker is 20 pixels wide by 32 pixels high.
		size: new google.maps.Size(40, 64),
		origin: new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at (0, 32).
		anchor: new google.maps.Point(0, 32)
	};

	$scope.ver_por_filtroList = [
		{ text: "Todo", checked: false, value:1 },
		
		{ text: "Tipo de venta", checked: false, value:2 },
		{ text: "Delegacion", checked: false, value:3 },
		{ text: "Temporada", checked: false, value:4 },
		{ text: "Dias", checked: false, value:5 }
	];


	//******************************* objet JSON a mandar  ********************************

	/* ========================== valores ====================
	insertRowsRef($nombre_tianguis, $temporada, $temp_inicial, $temp_final, $dias, $tipo_venta, $hora_inicial, $hora_final,
		$tipo_bloqueo, $reduccion_carriles, $latitud, $longitud, $delegacion, $calles){
	========================================================== */
	var reporteSend = {
		"nombre_tianguis":"",
		"temporada": "anual",
		"temp_inicial":"anual",
		"temp_final":"anual",
		"dias":"",
		"tipo_venta": "",
		"hora_inicial":"",
		"hora_final":"",
		"tipo_bloqueo":2,
		"reduccion_carriles":0,
		"latitud":"",
		"longitud":"",
		"delegacion":"deleacion",
		"calles":"calle"
	};

	$scope.tipo_venta_view = "";
	$scope.temporada_view = "";


	var fechaDeModal_Ini=0, fechaDeModal_Fin=0;
	var banderaBloqueoSelec=false;
	var banderaTemporadaSelec=false;
	var banderaDiasSelec=false;
	var banderaTipo_ventaSelec=false;

	//--------------  enviar unna list JSON a checkbox
	$scope.bloqueosList = [
		{ text: "Feria", checked: false, value:1 },
		{ text: "tianguis", checked: false, value:2 },
		{ text: "tianguis Segmentado", checked: false, value:3 },
		{ text: "Fiesta Patronal", checked: false, value:4 },
		
		{ text: "Accidente", checked: false, value:10 },
		{ text: "Fuga de Sustancias Peligrosas", checked: false, value:11 },

		{ text: "Salida Escolar", checked: false, value:15 },
		{ text: "Cierre por Obras", checked: false, value:16 },
		{ text: "Marchas", checked: false, value:17 },
		{ text: "Inundacion", checked: false, value:18 }
	];

	$scope.nivelList = [
		{ text: "nivel normal", checked: false, value:0 },
		{ text: "En Tunel/subsuelo", checked: false, value:-1 },
		{ text: "Primer Piso y superiores", checked: false, value:1 }
	];

	$scope.tipo_venta = [
		{ text: "Varios", checked: false, value:1 },
		
		{ text: "Artesanias", checked: false, value:2 },
		{ text: "Frutas y legumbres", checked: false, value:3 },
		{ text: "Materias primas", checked: false, value:4 },
		{ text: "Venta de animales domesticos", checked: false, value:5 },
		{ text: "Venta de animales (ganado)", checked: false, value:6 },
		{ text: "Bebidas alcoholicas", checked: false, value:7 },
		{ text: "Fuegos articiales", checked: false, value:8 },
		{ text: "Industrial", checked: false, value:9 },
		{ text: "Material pornográfico", checked: false, value:10 },
		{ text: "Peliculas", checked: false, value:11 },
		{ text: "Para defenza personal", checked: false, value:12 }
	];

	$scope.detenidoList = [
		{ text: "Total sin movimiento", checked: false, value:1 },
		{ text: "A vuelta de ruda", checked: false, value:2 }
	];

	$scope.dias = [
		{ text: "Lunes", checked: false, value:"Lun" },
		{ text: "Martes", checked: false, value:"Mar" },
		{ text: "Miercoles", checked: false, value:"Mie" },
		{ text: "Jueves", checked: false, value: "Jue"},
		{ text: "Viernes", checked: false, value:"vie" },
		{ text: "Sabado", checked: false, value:"Sab" },
		{ text: "Domingo", checked: false, value:"Dom" }
	];

	$scope.temporada = [
		{ text: "Anual", checked: false, value: "anual" },
		{ text: "Primavera", checked: false, value:"primavera" },
		{ text: "Otoño", checked: false, value:"otoño" },
		{ text: "Invierno", checked: false, value:"invierno" },
		{ text: "Verano", checked: false, value:"verano" }
	];


	google.maps.event.addDomListener(window, 'load', initialize());


	//******** NECESARIO para saber que valores toma el RADIO, se creo automatico data.elegidaHora 
	$scope.dataBloqueo = {
		clientSide: 'ng' //valor que envio por default
	};
	$scope.cambioRadioEscucha = function(item) {
		reporteSend.tipo_bloqueo = item.value;	
		banderaBloqueoSelec=true;		
		console.log("Radio bloqueo elegido", item.value, "banderaBloqueoSelec", banderaBloqueoSelec);
	}
	
	//======================= para $scope.temporada =============================================
	$scope.dataTemporada = {
		clientSide: 'ng' //valor que envio por default
	};
	$scope.cambioRadioTemporadaEscucha = function(item) {
		reporteSend.temporada = item.value;	
		banderaTemporadaSelec=true;		
		$scope.temporada_view = item.text;

		console.log("Radio temporada elegido:", item.value, "banderaTemporadaSelec", banderaTemporadaSelec);
	}
	//======================= para $scope.tipo_venta =============================================
	$scope.dataTipo_venta = {
		clientSide: 'ng' //valor que envio por default
	};
	$scope.cambioRadioTipo_ventaEscucha = function(item) {
		reporteSend.tipo_venta = item.value;	
		banderaTipo_ventaSelec=true;		
		$scope.tipo_venta_view = item.text;

		console.log("Radio tipo_venta elegido", item.value, "banderaTipo_ventaSelec", banderaTipo_ventaSelec);
	}
	//======================= para $scope.dias =============================================
	function getDiasSeleccionados(){
		var banderaPrimero=0;
		var diasSelec;

		console.log("enviarDatos:", $scope.dias.length );
		for (var j=0 ; j<$scope.dias.length; j++) {
			if( $scope.dias[j].checked==true){
				banderaDiasSelec=true;		
				banderaPrimero++;
				if(banderaPrimero==1)
					diasSelec = $scope.dias[j].value.toString();
				else
					diasSelec = diasSelec.concat( ",", $scope.dias[j].value.toString() );
			}
		}

		return diasSelec;
	} 

	/* //******* para mandar uno elegido por default, en html:  *********
	<ion-radio... ng-model="data.clientSide">
	saber selccionado {{ elegidaHora }}
	aqui controller:
	$scope.data = {
		clientSide: 'ng' //algun value:"ng" como 		{ text: "Mañana: 5 a 12", value:"ng" }
	};
	*/  

	function revisarBloqueo(){
		if( banderaBloqueoSelec ){
			return true;
		}
		return false;
	}

	function revisarNivel(){
		if( banderaNivelSelec ){
			return true;
		}
		return false;
	}

	function todosListo(hora_ini, hora_fin, seleccionoTemporada, seleccionoDias){

		if( !hora_ini || !hora_fin || !seleccionoTemporada || !seleccionoDias){
			if( !seleccionoTemporada )
				$scope.hideTemporada = false;
			else{
				$scope.hideTemporada = true;
			}	

			if( !seleccionoDias )
				$scope.hideDias = false;
			else{
				$scope.hideDias = true;
			}				
			

			if( !hora_ini )
				$scope.hideHoraInicio = false;
			else				
				$scope.hideHoraInicio = true;
			
			if( !hora_fin )
				$scope.hideHoraFin = false;
			else				
				$scope.hideHoraFin = true;

			return false;
		}else{
			$scope.hideTemporada = true;
			$scope.hideDias = true;
			$scope.hideHoraInicio = true;
			$scope.hideHoraFin = true;

			return true;
		}
		
	}

	//regresa el texto a mostrar, recordar value empieza en 1 pero el arreglo en 0
	function getTipoDelito(value){
	
		//Valor i+1, arreglo i creciente no es uno menor
		switch(value) {
			case 1:
				return $scope.bloqueosList[0].text;
				break;
			case 2:
				return $scope.bloqueosList[1].text;
				break;
			case 3:
				return $scope.bloqueosList[2].text;
				break;

			case 4:
				return $scope.bloqueosList[3].text;
				break;

			case 10:
				return $scope.bloqueosList[3].text;
				break;
			case 11:
				return $scope.bloqueosList[4].text;
				break;

			case 15:
				return $scope.bloqueosList[5].text;
				break;		
			case 16:
				return $scope.bloqueosList[6].text;
				break;						
			case 17:
				return $scope.bloqueosList[7].text;
				break;
			case 18:
				return $scope.bloqueosList[8].text;
				break;

			default:
				return "Bloqueo";
		}
	}

	//usamos el form para enviar datos
	$scope.enviarDatos = function(){
		console.log("enviarDatos" );		
		getDiasSeleccionados();
		if( todosListo(this.hora_inicial, this.hora_final, banderaTemporadaSelec, banderaDiasSelec) ){
	
			reporteSend.dias = getDiasSeleccionados();
			reporteSend.reduccion_carriles = this.redCarrilesModel;

			if(this.nombre_tianguis)
				reporteSend.nombre_tianguis = this.nombre_tianguis;
			else
				reporteSend.nombre_tianguis = null;

			reporteSend.temp_inicial = fechaDeModal_Ini;
			reporteSend.temp_final = fechaDeModal_Fin;

			if(this.hora_inicial)
				reporteSend.hora_inicial = $filter('date')(this.hora_inicial, "h:mm");
			else
				reporteSend.hora_inicial=null;

			if(this.hora_final)
				reporteSend.hora_final = $filter('date')(this.hora_final, "h:mm");
			else
				reporteSend.hora_final=null;

			reporteSend.delegacion = this.delegacion_model;
			reporteSend.calles = this.calles_model;
			
			$http.post("http://proyectos-mx.net/appbloqueos/web_bloqueos/insertar_bloqueo.php",{
				'reporteSend': reporteSend
			})
			.success(function(data, status, headers, config){
				console.log("inserted Successfully insertar_bloqueo");
				//console.log("data", data);

				regresaValores();
				regresaValoresHide();
				showDialog("Reporte","Guardado Exitosamente");
			})
			.error(function (data, status, headers, config){
				//console.log(JSON.stringify(headers, null, 4));	
				console.log("error de http"); 
				regresaValoresHide();
				showDialog("Ocurrio algun error","Intentarlo mas tarde");		
			});
			
									
			closeModalReportando();
			borraDatosPolygon();

			$scope.hideBotoneraRegistro = !$scope.hideBotoneraRegistro;
			$scope.hideButtonSigViewUserAMano = !$scope.hideButtonSigViewUserAMano;
			$scope.hideButtonReportar = !$scope.hideButtonReportar;

			console.log(JSON.stringify(reporteSend, null, 4));
		}
	}

	function regresaValores(){
		$scope.nombre_tianguis ="";
		$scope.temp_inicial ="";
		$scope.temp_final ="";
		$scope.hora_inicial ="";
		$scope.hora_final ="";
		$scope.delegacion_model ="";
		$scope.calles_model ="";
		$scope.redCarrilesModel =0;

		$scope.tipo_venta_view = "";
		$scope.temporada_view = "";
		
		$scope.dataTipo_venta.elegidoTipo_venta="";
		$scope.dataTemporada.elegidoTemporada="";

		for (var i = 0; i < $scope.dias.length; i++) {
			$scope.dias[i].checked =false;
		}

		banderaTemporadaSelec=false;
		banderaDiasSelec=false;		


		console.log("regresaValores ");
	}


	$scope.borrarDivMarker = function(){
		document.getElementById("divMarker").innerHTML = "";
	}
		//Dentro del ambito de trabajo
	$scope.actualizarMapa = function(){
		console.log("Actualizar mapa reporte");

		$scope.hideActualizaMapa = !$scope.hideActualizaMapa;
		
		// =============================================================
		returnValuesArraysPintanMapa();
		cargarBloqueosMapa();
		// =============================================================

		$scope.hideActualizaMapa = !$scope.hideActualizaMapa;

		/*
		setTimeout(function(){
			$scope.hideActualizaMapa = false;
			console.log("entra hideActualizaMapa");
		},2000,"JavaScript");
		*/
	}

	function getCalleDelegacion(geocoder, latlngRecuperar, inputDelegacion, inputCalles) {
	
		geocoder.geocode({'location': latlngRecuperar}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {

				//console.log("results", JSON.stringify(results, null, 4));

				$scope.calles_model = results[0].address_components[1].long_name;

				if(results[0].address_components[3].long_name != results[0].address_components[4].long_name)
					$scope.delegacion_model = results[0].address_components[3].long_name + " " + results[0].address_components[4].long_name;
				else
					$scope.delegacion_model = results[0].address_components[3].long_name;
				/*
				console.log( "calle", results[0].address_components[1].long_name );
				console.log( "Delegacion", results[0].address_components[2].long_name );
				console.log( "Delegacion 2", results[0].address_components[3].long_name );
				console.log( "Delegacion 3", results[0].address_components[4].long_name );
				*/
			} else {

			}
		});
	}

	// A confirm dialog
 $scope.ConfirmPopupCont_Partes = function() {
	 var confirmPopup = $ionicPopup.confirm({
		 title: 'Geometria de Bloqueo',
		 template: '¿El bloqueo es continuo, sin segmentos?',
			scope: $scope,
		 buttons: [
			{ 
				text: 'No, es </br> Segmentado',
				onTap: function(e) {
					console.log("entra en no, es segmentado");
					regresaValores();

					closeModalReporteConPorPartes(1);    
					//mover
					reporteSend.tipo_bloqueo = 3;
				}

			},
			{
				text: '<b>Si</b>',
				type: 'button-positive',
				onTap: function(e) {
					console.log("entra en SI");

					regresaValores();
					closeModalReporteConPorPartes(0);    
				}
			}
		]
	 });


 };

	// An alert dialog
	function showDialog(miTitle, miTemplate) {
		var alertPopup = $ionicPopup.alert({
			title: miTitle,
			template: miTemplate
		});

		alertPopup.then(function(res) {
			console.log('Thank you for not eating my delicious ice cream cone');
		});
	}

	// ******************************** para model controller ********************************
	//$ionicModal.fromTemplateUrl('modal_tipo_delito.html', {
	$ionicModal.fromTemplateUrl('templates/modal_tipo_bloqueo.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		$scope.modalBloqueo = modal;
	});

	$scope.openModalTipoBloqueo = function() {

		if (posMarker > 0 || arrayDePolygon.length > 0){
			//$scope.modalBloqueo.show();
		
			//============   solo para tianguis  ===============	

			if(arrayDePolygon.length>0){
				$scope.guardaEnArrayPath(); // para guardar el ultimo path tramo
				var coorAux = contatCadaPath( arrayDePolygon ); //Por Partes
			}else{
				// procesamos lat y long de los markers
				var coorAux = regresaLatLngContat();
			//console.log( "coords", coorAux[0][0], " ", coorAux[0][1]);
			}
			
			getCalleDelegacion(new google.maps.Geocoder, new google.maps.LatLng( coorAux[0][0],coorAux[0][1] ), "delegacionModel", "callesModel" );

			openModalReportando();
		}else{
			showDialog("Reporte Primero","Dibuje pulsando sobre el mapa por favor");
		}
	}

	$scope.closeModalTipoBloqueo = function() {	
		console.log("closeModalTipoBloqueo", revisarBloqueo());

		if( revisarBloqueo() ){
			$scope.modalBloqueo.hide();
			openModalReportando();
		}	
	}

	//=================================   modal para  FILTROS ver_por =============================================
	$ionicModal.fromTemplateUrl('templates/modal_filtro.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		$scope.modalVerPor = modal;
	});

	$scope.openModalVerPor = function() {
		$scope.modalVerPor.show();		
	}

	$scope.closeModalVerPor = function() {			
		$scope.modalVerPor.hide();
	}

	// ========= fuciones para ver por TipoVenta =========
	$scope.dataFiltroTipoVenta = {
		clientSide: 'ng' //valor que envio por default
	};
	$scope.cambioRadioFiltroTipoVentaEscucha = function(item) {
		ocultaPorTipoVenta(item);
	}

	//auxDescripcion:  Tianguis_suNombre_tipoVenta	
	//title: Dias, temporada y direccion
	function ocultaPorTipoVenta(valueSeleccionado){
		for (var i = 0; i < markerCoordinates.length; i++) {
			if( markerCoordinates[i].getTitle().indexOf(valueSeleccionado) === -1 ) //true  con !==
				markerCoordinates[i].setVisible(false);
			else
				markerCoordinates[i].setVisible(true);
		}
	}

	$scope.verTodosFiltro = function(){
		
		for (var i = 0; i < markerCoordinates.length; i++) {
				markerCoordinates[i].setVisible(true);
				polygonArray[i][0].setVisible(true)
		}	

		$scope.closeModalVerPor();
	}

	$scope.verPorDelegacionFiltro = function(){
		console.log("verPorDelegacionModel", this.verPorDelegacionModel);

		for (var i = 0; i < markerCoordinates.length; i++) {
			if( markerCoordinates[i].getTitle().indexOf( primeraLetraMayus(this.verPorDelegacionModel) ) == -1 ){ //true  con !==
				markerCoordinates[i].setVisible(false);
				polygonArray[i][0].setVisible(false)
			}else{
				markerCoordinates[i].setVisible(true);
				polygonArray[i][0].setVisible(true)
			}
		}	
		$scope.closeModalVerPor();
	}
	function primeraLetraMayus(texto){
		return texto.charAt(0).toUpperCase() + texto.slice(1);
	}

	$scope.verPorHoraFiltro = function(){
		//console.log("polygonArray[0].getPath()", polygonArray[0][0].getPath(), polygonArray[0][2] );
		
		for (var i = 0; i < markerCoordinates.length; i++) {
			console.log("valores ", polygonArray[i][1], polygonArray[i][2], (this.verPorHoraModel*60));
			if ( polygonArray[i][1]<parseInt(this.verPorHoraModel*60) && polygonArray[i][2]>parseInt(this.verPorHoraModel*60) ){
				markerCoordinates[i].setVisible(true);
				polygonArray[i][0].setVisible(true);
			}else{
				markerCoordinates[i].setVisible(false);
				polygonArray[i][0].setVisible(false);
			}
		}	
		

		$scope.closeModalVerPor();
	}





	//==============================================================================


	$ionicModal.fromTemplateUrl('templates/modal_reportando.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalReportando = modal;
	});

	function openModalReportando() {
		$scope.modalReportando.show();
	}

	function closeModalReportando() {
		$scope.modalReportando.hide();
	}

	//============= para modal tipo de reporte continuo o discreto ===============
	$ionicModal.fromTemplateUrl('templates/modal_reporte_continuo_por_partes.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		$scope.modalTipoReporteConti_Partes = modal;
	});

	/*	=============================================
	Tipo de reporte sea continuo 0, por partes 1
	=============================================   */
	$scope.openModalReporteConPorPartes= function(  ) {
		$scope.modalTipoReporteConti_Partes.show();
	}
	//	$scope.closeModalReporteConPorPartes = function( valorTipoReporte ) {	
	function closeModalReporteConPorPartes( valorTipoReporte ) {	
		console.log("closeModalReporteConPorPartes", valorTipoReporte );

		$scope.hideBotoneraRegistro = !$scope.hideBotoneraRegistro;

		if( valorTipoReporte == 0){  //CONTINUO
			//Cambia de clase a verde
			$scope.hideButtonSigViewUserAMano = !$scope.hideButtonSigViewUserAMano;
			$scope.hideButtonReportar = !$scope.hideButtonReportar;

			$scope.hideButtonRegresaPoligono = !$scope.hideButtonRegresaPoligono;
			$scope.hideButtonCancelContinuo = !$scope.hideButtonCancelContinuo;
			
		}else{
			$scope.hideButtonSigViewUserAMano = !$scope.hideButtonSigViewUserAMano;
			$scope.hideButtonReportar = !$scope.hideButtonReportar;
			$scope.hideButtonSigTramo = !$scope.hideButtonSigTramo;

			$scope.hideButtonRegresaPoligono = !$scope.hideButtonRegresaPoligono;
			$scope.hideButtonCancelPartes = !$scope.hideButtonCancelPartes;
		}	
		//$scope.modalTipoReporteConti_Partes.hide();
	}
	//--------------------- FIN tipo de reporte continio o por partes --------

	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});

	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});


	//************************ modal de datapicker ************************
	var opcionesFecha = {
		callback: function (val) {  //Mandatory
			console.log('Return value from the datepicker popup is : ' + val, new Date(val));
		},
		disabledDates: [            //Optional
			new Date(2016, 2, 16),
			new Date(2015, 3, 16),
			new Date(2015, 4, 16),
			new Date(2015, 5, 16),
			new Date('Wednesday, August 12, 2015'),
			new Date("08-16-2016"),
			new Date(1439676000000)
		],
		from: new Date(2012, 1, 1), //Optional
		to: new Date(2016, 10, 30), //Optional
		inputDate: new Date(),      //Optional
		mondayFirst: true,          //Optional
		disableWeekdays: [0],       //Optional
		closeOnSelect: false,       //Optional
		templateType: 'popup'       //Optional
	};

	//==================  FECHAS ==================================

	$ionicModal.fromTemplateUrl('templates/datemodal.html', 
		function(modal) {
			$scope.datemodal = modal;
			console.log("templates/datemodal.html", $scope.datemodal);
		},{
		// Use our scope for the scope of the modal to keep it simple
		scope: $scope, 
		// The animation we want to use for the modal entrance
		animation: 'slide-in-up'
		}
	);
	$scope.opendateModal = function() {
		//ionicDatePicker.openDatePicker(opcionesFecha);
		$scope.datemodal.show();
	}
	$scope.closedateModal = function(modal) {
		$scope.datemodal.hide();
		$scope.temp_inicial = modal;
		fechaDeModal_Ini=$scope.temp_inicial;
		console.log("closedateModal fecha:", $scope.temp_inicial);
	}

	$ionicModal.fromTemplateUrl('templates/datemodal_final.html', 
		function(modal) {
			$scope.datemodalFinal = modal;
			console.log("templates/datemodal_final.html", $scope.datemodalFinal);
		},{
		// Use our scope for the scope of the modal to keep it simple
		scope: $scope, 
		// The animation we want to use for the modal entrance
		animation: 'slide-in-up'
		}
	);
	$scope.opendateModalFinal = function() {
		//ionicDatePicker.openDatePicker(opcionesFecha);

		$scope.datemodalFinal.show();
	}
	$scope.closedateModalFinal = function(modal) {
		$scope.datemodalFinal.hide();
		$scope.temp_final = modal;
		fechaDeModal_Fin=$scope.temp_final;
		console.log("closedateModalFinal fecha:", $scope.temp_final);
	}
	//**************************  fin de cosas de modals ****************************************

	//*****************  eventos antes y despues de cargar View  ***********************
	$scope.$on("$ionicView.afterEnter", function(){
		$timeout(function() {
			console.log("afterEnter");
			//$scope.map.control.refresh({lat: miPosicion[0], lng: miPosicion[1]});	

		});
	});

	//tiene que ver esto como almacenamiento en caché es en gran parte y de verificación si la búsqueda ha cambiado cada vez que se muestra de nuevo
	$scope.$on('$ionicView.beforeEnter', function() {
		console.log('beforeEnter');
		//checkLocation();
	});
	//******************************************************************************

	function initialize() {
		console.log("Initialize MapaReporteCtrl");

		miPosicion = [];

		navigator.geolocation.getCurrentPosition(function(position){
			miPosicion.push(position.coords.latitude);
			miPosicion.push(position.coords.longitude);
		});

		var mapOptions = {
			// the Teide ;-)
			center: {lat: miPosicion[0], lng: miPosicion[1]},
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControlOptions: {
				mapTypeIds: []
			},
			panControl: false,
			streetViewControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			}
		};

		map = new google.maps.Map(document.getElementById("map"), mapOptions);
		
		
		// =============================================================
		cargarBloqueosMapa();
		// =============================================================

		navigator.geolocation.getCurrentPosition(function(pos) {
			map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		});

		//------------------ dibujar poligono  ------------
		posMarker = 0;

		polygon = new google.maps.Polyline({
			strokeColor: '#FF0101',
			strokeOpacity: 0.8,
			strokeWeight: 3
		});
		polygon.setMap(map);

		// Add a listener for the click event
		map.addListener('click', addPoligono);

		// Gestiona los eventos de clic en un mapa, y añade un nuevo punto a la Polyline
		function addPoligono(event) {

			if( $scope.hideButtonReportar ){
				path = polygon.getPath();

				 // Debido a que es una ruta MVCArray, simplemente puede añadir una nueva coordenada
				 // Y aparecerá automáticamente.
				path.push(event.latLng);

				// Add a new marker at the new plotted point on the polyline.
				arrayMarker[posMarker] = new google.maps.Marker({
					position: event.latLng,
					//title: '#' + path.getLength(),
					map: map
				});

				/* =======================================================================			
					Evento que cierra una poliliena poniendo un evento al marker para cerrar
				======================================================================= */			
				google.maps.event.addListener(arrayMarker[posMarker], 'click', function(event){
					//console.log(marker.getPosition(), " ", marker.getPosition().lat() );
				
					console.log("addListener(arrayMarker[posMarker] event", JSON.stringify(event, null, 4));
					path = polygon.getPath();

					 // Debido a que es una ruta MVCArray, simplemente puede añadir una nueva coordenada
					 // Y aparecerá automáticamente.
					path.push(event.latLng);

					// Add a new marker at the new plotted point on the polyline.
					arrayMarker[posMarker] = new google.maps.Marker({
						position: event.latLng,
						//title: '#' + path.getLength(),
						map: map
					});

					posMarker++;
				});

				posMarker++;
			}
		}
		//------------------ FIN dibujar pologono  ------------


		//------- Este evento se activa cuando cambia la propiedad del centro de mapa.
		map.addListener('center_changed', function() {
			latSendVar = map.getCenter().lat();		  
			lngSendVar = map.getCenter().lng();

			var geocoder = new google.maps.Geocoder;
			var infowindow = new google.maps.InfoWindow;

			geocodeLatLng(geocoder, map, infowindow, new google.maps.LatLng( latSendVar, lngSendVar), "addressViewReport");
		});

		$scope.map = map;
	}

	function pintaCadaSegmento( latAssoc, lngAssoc, data, banderaPonUnMarker ){
		//separamos en array las coordenadas y las ponemos en las rutas ROUTES					
	
		var latParaMarker, lngParaMarker;

		for (j=0; j<latAssoc.length; j++) {
			if(j==0){
				latParaMarker = latAssoc[j];
				lngParaMarker = lngAssoc[j];
			}
			routes.push(
				new google.maps.LatLng(latAssoc[j], lngAssoc[j])
				);
		} 


		var miStrokeColor; 
		if(data[i].tipo_bloqueo == 1){
			miStrokeColor = "#d10000"; //rojo
		}else if(data[i].tipo_bloqueo == 2){
			miStrokeColor = "#0000FF";//continuo Azul fuerte
		}else if(data[i].tipo_bloqueo == 3){ 
			miStrokeColor = "#2ebfd6"; //segmentado Azul claro
			image.url="img/icon_tianguis_segmento.png";
		}else if(data[i].tipo_bloqueo == 10){
			miStrokeColor = "#FF00FF"; //purpura
		}
		else{
			miStrokeColor = "#9400D3";//morado
		}


		myStack.push(routes);
		var polyline = new google.maps.Polyline({
			path: routes
			, map: map
			, strokeColor: miStrokeColor
			, strokeWeight: 5
			, strokeOpacity: 0.8
			, clickable: true
		});
		
		polyline.setMap(map);
		routes.splice(0, routes.length); 

		/* =========================================================
		Guardaremos la hora en minutos para comparar mas rapido
		=========================================================   */
		var hora_inicial_split = data[i].hora_inicial.split(':'); // split it at the colons
		var hora_final_split = data[i].hora_final.split(':'); // split it at the colons

		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		var minutosData_hora_inicial = parseInt(hora_inicial_split[0] * 60) + parseInt(hora_inicial_split[1]); 
		var minutosData_hora_final = parseInt(hora_final_split[0] * 60) + parseInt(hora_final_split[1]); 

		polygonArray.push( [polyline, minutosData_hora_inicial, minutosData_hora_final] );
		//  ===============================================================

		//auxDescripcion:  Tianguis_suNombre_tipoVenta
		var auxDescripcion = getTipoDelito( parseInt(data[i].tipo_bloqueo) );
		auxDescripcion = auxDescripcion +" "+ data[i].nombre_tianguis;
		//if( data[i].tipo_venta )
		//	auxDescripcion = auxDescripcion + " Venta de " + data[i].tipo_venta;

		//title: Dias, temporada y direccion
		var miTitle = data[i].dias+" de "+data[i].hora_inicial+"-"+data[i].hora_final + "</br>" +data[i].temp_inicial +" a "+data[i].temp_final+ "</br>" + data[i].delegacion+" "+data[i].calles;

		//console.log("miTitle", miTitle);
		//console.log("auxDescripcion", auxDescripcion);

		//if(banderaPonUnMarker){

			marker = new google.maps.Marker({
				position: new google.maps.LatLng( latParaMarker, lngParaMarker ),
				map: map,
				title: miTitle,
				animation: google.maps.Animation.DROP,
				label:auxDescripcion,
				icon: image,
				visible:true
			});

			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				return function() {
					//console.log(marker.getTitle(), " ", marker.getLabel() );

					document.getElementById("divMarker").innerHTML = 
						marker.getLabel()  + "<br>" + marker.getTitle();  // Agrego nueva linea antes

					//********** Marker SALTADOR ****************
					if (marker.getAnimation() !== null) {
						marker.setAnimation(null); //parar
					} else {
						marker.setAnimation(google.maps.Animation.BOUNCE);
						setTimeout(function(){
							marker.setAnimation(null);
						},2000,"JavaScript");	
					}

				}
			})(marker, i));
			
			markerCoordinates.push(marker);

		//}
		//************************* eventos de polilinea   *************************************
		/*google.maps.event.addListener(polyline, 'click', (function(polyline, i) {
			return function() {
				console.log("mi polyline" );
				//********** polilinea que cambia de color 2 seg ****************
				polyline.setOptions({strokeColor:'#FF00FF'});

				setTimeout(function(){
					polyline.setOptions({strokeColor:"#FF00FF"});
				},2000,"JavaScript");	
			}
		})(polyline, i));*/
		//********************************************************************

	}


	var poligonoCoordinates = {};

	// initialize your stack
	var myStack=[];
	var routes = [];


	function cargarBloqueosMapa(){
		$http.get('http://proyectos-mx.net/appbloqueos/web_bloqueos/obtener_altitud_bloqueosPDO.php')
			.success(function(data){//success() llamada AJAX

				//console.log("cargando data", data[0].latitud);
				var banderaPonUnMarker = true;

				for (i = 0; i < data.length; i++) { 
					banderaPonUnMarker = true;

					/* ===================================
					Es un tianguis segmentado
					===================================  */
					if( data[i].tipo_bloqueo == 3 ){

						var latSegmentAssoc =  data[i].latitud.split("%");
						var lngSegmentAssoc =  data[i].longitud.split("%");

						for (var j = 0; j < latSegmentAssoc.length; j++) {
							var latAssoc =  latSegmentAssoc[j].split(",");
							var lngAssoc =  lngSegmentAssoc[j].split(",");

							pintaCadaSegmento(latAssoc, lngAssoc, data, banderaPonUnMarker);

							banderaPonUnMarker=false;
						}

					/* ===================================
					Para tianguis continuo 
					===================================  */
					}else{
						var latAssoc =  data[i].latitud.split(",");
						var lngAssoc =  data[i].longitud.split(",");

						pintaCadaSegmento(latAssoc, lngAssoc, data, banderaPonUnMarker);

					}
					//==================================================================	
				}
			});
	}

	function returnValuesArraysPintanMapa(){
		/*
		console.log( " =================== returnValuesArraysPintanMapa  =====================");
		console.log( "poligonoCoordinates",  typeof(polygonArray) , " ", polygonArray.length);
		console.log( "markerCoordinates",  typeof(markerCoordinates) , " ", markerCoordinates.length );
		console.log( "myStack", typeof(myStack), " ", myStack.length );
		console.log( "routes",  typeof(routes) , " ", routes.length );
		*/
		
		
		for (var i = 0; i < polygonArray.length; i++) {
			polygonArray[i][0].setMap(null);
		}
		for (var i = 0; i < markerCoordinates.length; i++) {
			markerCoordinates[i].setMap(null);
		}
		for (var i = 0; i < myStack.length; i++) {
			myStack.splice(i, 1);
		}

		polygonArray.length = 0;
		markerCoordinates.length = 0;
		myStack.length = 0;
		routes.length  = 0;	
	}

	function regresaValoresHide(){
		/*	=================================
		ng.hide Esconde cuando es TRUE 
		===================================  */	
		$scope.hideBotoneraRegistro = true;

		$scope.hideButtonRegresaPoligono = true;
		$scope.hideButtonCancelContinuo = true;
		$scope.hideButtonCancelPartes = true;
		
		$scope.hideButtonSigTramo = true;
		$scope.hideButtonSigViewUserAMano = true;
		
		$scope.hideButtonReportar = false;
		
		$scope.hideActualizaMapa = false;

		$scope.hideDias = true;
		$scope.hideTemporada = true;
		$scope.hideHoraInicio = true;
		$scope.hideHoraFin = true;

		$scope.showTipoVenta=true;
		$scope.showTemporada=true;
	}

	$scope.cancelarReporte = function(){
		regresaValoresHide();

		borraDatosPolygon();
		borraDatosPolygonPorPartes();

	}

	$scope.cancelarPoligono = function() {
		borraDatosPolygon();
	};

	
	$scope.cancelarPoligonoPartes = function() {
		borraDatosPolygon();
		borraDatosPolygonPorPartes();
	};

	/* ===========================================================
		Recordar cada pos de arrayDePolygon tiene un path asi que debemos 
		recorrer ese path eliminando del mapa uno por uno   
		=========================================================== */
	function borraDatosPolygonPorPartes(){
		for (var i = 0; i < arrayDePolygon.length; i++) {
			for (var j = 0; j< arrayDePolygon[i].getPath().length; j++) {
				arrayDePolygon[i].getPath().pop();
			}
		}
		arrayDePolygon.length=0;
		arrayDePath.length=0;
		posArrayPathPintadoMapa=0;
	}

	function borraDatosPolygon(){
		//for(i=0; i<=posMarker; i++){
		while(posMarker>0){
			path.pop();
			posMarker--;
			arrayMarker[posMarker].setMap(null);

			//console.log("borraDatosPolygon", posMarker);
		}
	}

	$scope.regresarPoligono = function() {
		console.log("regresarPoligono");
		if(path.length > 0){
			path.pop();
			posMarker--;
			arrayMarker[posMarker].setMap(null);
		}
	};


	//---------- obtencion de etiqueta "select optin¡on" con JS --------------------
	/*
	var tipoBloqueo = document.getElementById("tipoBloqueo");
	var textoSelect = tipoBloqueo.options[tipoBloqueo.selectedIndex].text;
	var valorSelect = document.getElementById("tipoBloqueo").value;
	*/

	//--------------------- objet JSON a mandar 
	
	var arrayAux=[];
	arrayAux[0]=[24, 34];

	function contatCadaPath(arrayDePath){

		var coorAux = [];

		var banderaPrimero=0;
		var aux11="";
		var aux22="";

		for (i= 0; i<arrayDePath.length; i++) {
			for(j=0; j<arrayDePath[i].getPath().b.length; j++){
				banderaPrimero++;

				if(banderaPrimero == 1){
						aux11 = aux11 + arrayDePath[i].getPath().b[j].lat().toString();
						aux22 = aux22 + arrayDePath[i].getPath().b[j].lng().toString();
				}else{
						aux11 = aux11.concat( ",",  arrayDePath[i].getPath().b[j].lat().toString() );
						aux22 = aux22.concat( ",",  arrayDePath[i].getPath().b[j].lng().toString() );
				}

				coorAux.push( [ arrayDePath[i].getPath().b[j].lat() , arrayDePath[i].getPath().b[j].lng()] );
				console.log("vuelta i:", i, " j:", j, arrayDePath[i].getPath().b[j].lat(), " ", arrayDePath[i].getPath().b[j].lng() );
			}
			banderaPrimero=0;
			if ( i != arrayDePath.length-1 ){
				/*  =====================================================================			
				separacion por huecos, en JSON sera por "-" y las coordenadas por ","
				=====================================================================   */			
				aux11 = aux11+"%";
				aux22 = aux22+"%";	
			}
			
		}
		reporteSend.latitud = aux11;
		reporteSend.longitud = aux22;

		console.log("contatCadaPath por partes  -------------- ");
		console.log("auxCadenaLatitudes", aux11);
		console.log("auxCadenaLongitudes", aux22);

		console.log("regreso", coorAux.length, "-------------");

		return coorAux;
	}


	/* =================================================================
	Borramos path para pintar uno nuevo pero antes guardamos 
	en arrayDePath los path dibujamos previamente
	=================================================================  */
	$scope.guardaEnArrayPath = function(){
		console.log("guardaEnArrayPath function", polygon.getPath().length );

		if( polygon.getPath().length > 0){
			/* =================================================================
			solopara clonar ARRAYS.slice(), regresa una clonacion, no por referencia
			con angular.copy( var_regresar_clonada ) regreso un clon 
			=================================================================  */
			arrayDePath.push( angular.copy(polygon.getPath())  );
			borraDatosPolygon();

			console.log("arrayDePath[posArrayPathPintadoMapa]", arrayDePath[posArrayPathPintadoMapa].getAt(0).lat());

			arrayDePolygon.push( new google.maps.Polyline({
					path: arrayDePath[posArrayPathPintadoMapa],
					geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 3
				})
			);

			//debo dibujar el que borre para despues guardar su parte
			arrayDePolygon[posArrayPathPintadoMapa].setMap(map);

			posArrayPathPintadoMapa++;
			console.log("after guardaEnArrayPath", arrayDePolygon.length, arrayDePath.length);
		}
	}

	function regresaLatLngContat(){
		console.log("regresaLatLngContat");

		var coorAux = [];

		var banderaPrimero=0;
		var aux11="";
		var aux22="";
		for(i=0; i<path.b.length; i++){
			//arrayAux[i]=[path.b[i].lat(), path.b[i].lng()];
			banderaPrimero++;

			if(banderaPrimero == 1){
					aux11 = path.b[i].lat().toString();
					aux22 = path.b[i].lng().toString();
			}else{
					aux11 = aux11.concat( ",",  path.b[i].lat().toString() );
					aux22 = aux22.concat( ",",  path.b[i].lng().toString() );
			}

			coorAux.push( [ path.b[i].lat() , path.b[i].lng()] );
			console.log("vuelta", i, path.b[i].lat(), " ", path.b[i].lng() );
		}  

		reporteSend.latitud = aux11;
		reporteSend.longitud = aux22;

		console.log("auxCadenaLatitudes", aux11);
		console.log("auxCadenaLongitudes", aux22);

		console.log("regreso", coorAux.length);

		return coorAux;
	}

	$scope.guardarPoligono = function() {
		console.log( "guardarPoligono" );

		//console.log(JSON.stringify(tipoBloqueo, null, 4));
		//console.log( "path.b", path.b[0].lat() );
		//console.log(JSON.stringify(path.b[0], null, 4));
		
		/* espsificaciones objeto Path y LatLng 
		https://developers.google.com/maps/documentation/javascript/reference#LatLng

		method lat(), lng(), toJSON()...	
		*/
		if(path.b.length == 1)
			reporteSend.geometry = 1;

		else if(path.b[0].lat() == path.b[path.b.length-1].lat()  &&  path.b[0].lng() ==  path.b[path.b.length-1].lng()  )
			reporteSend.geometry = 2; //poligono
		else 
			reporteSend.geometry = 3; //forma


		reporteSend.type = parseInt(valorSelect);
		reporteSend.level = 0;

		reporteSend.coordinates = arrayAux;

		console.log("reporteSend", JSON.stringify(reporteSend, null, 4));

		borraDatosPolygon();

		document.getElementById('ver').style.display = 'block';
		setTimeout(function(){
			document.getElementById('ver').style.display = 'none';
		},2000,"JavaScript");	

		//$('#ver').hide(); //muestro mediante clase

		console.log("termino");

	};

	$scope.irPosActual = function(){
		map.setCenter( new google.maps.LatLng( miPosicion[0], miPosicion[1] ) );				
	}

	//-------------  Direccion  --------------
	$scope.addaddressViewReport = function() {
		var geocoder = new google.maps.Geocoder();
		geocodeAddress(geocoder, map);
	}

	function geocodeAddress(geocoder, resultsMap) {
			
		var address = document.getElementById('addressViewReport').value;
		geocoder.geocode({'address': address}, function(results, status) {
			
			if (status === google.maps.GeocoderStatus.OK) {
				resultsMap.setCenter(results[0].geometry.location);


				/* iconoc personalozado */
				/*var image = 'images/beachflag.png';
				var markerDireccion = new google.maps.Marker({
					map: resultsMap,
					position: results[0].geometry.location,
					icon: image
				});*/
				//----------------------------

				var markerDireccion = new google.maps.Marker({
					map: resultsMap,
					position: results[0].geometry.location
			 });

				setTimeout(function(){
						markerDireccion.setMap(null);
				},2000,"JavaScript");

			} else {
				alert('Vuelva a escribir la direcciòn. gracias.');
			}
		});
	}



}])


//******************   Reverse Geocoding   poner direccion en adress input **************************** 
	function geocodeLatLng(geocoder, map, infowindow, latlngRecuperar, miInput) {
	
		geocoder.geocode({'location': latlngRecuperar}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {

				//console.log("results", JSON.stringify(results, null, 4));

				if (results[1]) {				 
					document.getElementById(miInput).value = results[1].formatted_address;
				} else {
					//window.alert('No results found');  o enviar valor a input document.getElementById("Text2").value

				}
			} else {
				//window.alert('Geocoder failed due to: ' + status);
			}
		});
	}

	
