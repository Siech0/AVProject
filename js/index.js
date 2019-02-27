console.log("Hello World!");

$( function() {
	$(".draggable").draggable({
    scope: "buttonBox"});
} );

//Function to hide master_main_container id
$( function() {
    $("#master_close").click(function(){
        $("#master_main_container").hide(500);
    });
});

//Function to hide breakers_main_container id
$( function() {
    $("#breakers_close").click(function(){
        $("#breakers_main_container").hide(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#switches_close").click(function(){
        $("#switches_main_container").hide(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#master_button").click(function(){
        $("#master_main_container").show(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#breaker_button").click(function(){
        $("#breaker_main_container").show(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#switches_button").click(function(){
        $("#switches_main_container").show(500);
    });
});

// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );
 
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );