$(document).ready(function(){
	
	$("#mostrar").click(function(){
		$('#ver').show("slow");

	 });
	
	$("#ocultar").click(function(){
		$('#target').hide(3000);
		$('.target').hide("fast");
	 });

});